import { build as viteBuild, type InlineConfig } from 'vite'
import { _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction
} from '../../../../fe3/src/index.ts'
import type {
  FeBuilderVitexRunnerCtx, FeBuilderVitexEntryCtx, FeBuilderCtx, FeBuilderReturnCode,
  FeBundlerVitexConfig,
  BuilderEffectiveConfig, BuilderEffectiveLocalConfig, BuilderLocalConfig, BuilderCommonConfig,
  ViteCommonConfigFn, ViteCommonConfigFnProps, ViteLocalConfigFnProps,
} from './types.d'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'
import { coreBulder } from '../abstract/core.ts'
import { FeBuilderRunnerCtx } from '../abstract/runner.ts'


//  Loading and execution oder:
//  Loading order:
//  common build config and common vite fn preloaded by the calling script
//  command line args
//  (change of cwd if requested in command line args or the cb in the common build config ts)
//  local/cwd package.json (assumed to exist)
//  local/cwd build config (toml)
//  local/cwd vite ts (function)
//  Exec order (post loading):
//  tsc with the tsc config path calculated from the config
//  common vite fn evaluated
//  local/cwd vite fn evaluated
//  vite build ran

export async function viteBuilder (
  props: FeBuilderVitexEntryCtx
): Promise<FeBuilderReturnCode> {

  const builderCtx = {
    builderConfigPreps: {
      pre: loadConfig // await loadConfig({...props, catchComm: _catch})
    }

  } satisfies FeBuilderCtx<
      FeBundlerVitexConfig, {
        // extension props
      }
    >

  const runnerCtx = new FeBuilderRunnerCtx({
    ...props,
    bundlerName: 'vite',
    builderName: props.builderName || 'vite-x',
  })
  // satisfies Omit<FeBuilderVitexRunnerCtx, 'builderCtx'|'resolve'|'prompt'|'color'|'catchComm'>



  let viteConfig = {} as InlineConfig

  const returnCode = coreBulder<FeBuilderVitexRunnerCtx,FeBundlerVitexConfig>(runnerCtx, builderCtx)


  const _catch = await runnerCtx.ctxSignals.catchCommReady.tillPassed
  const _prompt = runnerCtx.prompt  // is ready when catch ready

  runnerCtx.execSignals.config_pkglocal.request()
  await runnerCtx.execSignals.config_pkglocal.tillRequested
  runnerCtx.execSignals.additional.done()


    // now we parse different build and vite configs possibly coming from different sources

    // const builderConfig = await loadConfig({...props, catchComm: _catch})

  function a () {

    if (builderConfig.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
      _prompt.log.step(`evaluating common config`)

      _catch.framingMessage = `Failed at vite-common-config function`
      builderConfig.viteCommonConfig = props.viteCommonConfigFn // assumed to be a function if not null
        ?
          await props.viteCommonConfigFn({
            mode: 'build',
            config: builderConfig,
            resolve,
            _prompt
          })
        : {}
    }

    _catch.framingMessage =
      `Failed importing the local vite config ts (${builderConfig.files.viteLocalConfigTsPath})`
    if (builderConfig.files.viteLocalConfigTsPath) {
      _prompt.log.warn('Local vite config ts can not be determined. \n' +
        'If this is not how you intended it to be, please check the defaults and other related settings.')
    } else {
      const viteLocalConfigFn = await import(builderConfig.files.viteLocalConfigTsPath)
      _feAssertIsAsyncFunction<InlineConfig,[ViteLocalConfigFnProps]>(
        viteLocalConfigFn,
        {message: 'Local vite config is not a function'}
      )

      _catch.framingMessage = `Failed at vite-local-config function`
      viteConfig = await viteLocalConfigFn({
        mode: 'build',
        config: builderConfig,
        resolve,
        _prompt
      })
    }


    async function main (
      ctx:
    ) {

      await viteBuild({
        ...viteConfig,
        configFile: false,
      })
    }

    return await returnCode
  }
}
