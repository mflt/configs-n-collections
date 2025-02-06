import { _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction, 
  FePromisewithResolvers,
  _feIsAsyncFunction
} from '../../../../fe3/src/index.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import {
  FeBuilderCtx, FeBuilderReturnCode, 
  FeBundlerConfigPrototype,
} from './types.d'
import {
  FeBuilderRunnerCtx, FeCatchComm
} from './runner.ts'
import { loadConfig } from './loadConfig.ts'

export { prompt }

Error.stackTraceLimit = Number.POSITIVE_INFINITY  // @TODO why is this

const PROD = Bun.env.NODE_ENV === 'production'

const resolve = (path: string) => {
  const resolved = import.meta.resolve?.(path)
  if (!resolved) {
    throw new Error(`Not found: ${path}, maybe on wrong node version`)
  }
  return resolved.replace('file:/', '')
}

const catchComm: FeCatchComm = {
  framingMessage: '' as string|undefined
}

// loading buildCommonConfig and viteCommonConfigFn is delegated to the caller, as it can do it statically


export async function bulderBase <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void,
> (
  runnerCtx: FeBuilderRunnerCtx<BundlerConfig, BuilderExtensionProps>,
  builderCtx: FeBuilderCtx<BundlerConfig, BuilderExtensionProps>, 
): Promise<FeBuilderReturnCode> {

  const r = runnerCtx

  r.prompt ??= prompt
  r.color ??= color
  const { 
    prompt: _prompt,
    color: _color
  } = r
  _prompt.intro(`${r.builderName || '<missing name>'} builder started`)
  // if no bundlername, prompt


  r.getBuilderCtx ??= ()=> builderCtx
  r.resolve ??= resolve
  r.catchComm ??= catchComm
  r.ctxSignals.catchCommReady.pass(r.catchComm)

  const _catch = r.catchComm

  try {

    r.step('config_pkglocal')

    _feAssertIsObject(proc)

    const builderConfig = await builderConfigPreps.pre({})
    // loadConfig({...props, catchComm: _catch})

    if (proc.ifTscistobeRan) {

      _prompt.log.step(`tsc started`)
      // console.warn(builderConfig)

      _catch.framingMessage = `Failed at tsc`
      // await $`tsc -b ${buildConfig.files.tscLocalConfigJsonPath}`

      _prompt.log.step(`tsc ended`)
    }

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

    // await viteBuild({
    //   ...viteConfig,
    //   configFile: false,
    // })

    _prompt.outro('Lib building ended nicely')
    return FeBunViteBuilderReturnVariants.done

  } catch (err) {
    _prompt.log.error(`${
      (_catch.framingMessage || '') + 
      (err?.message ? '\n' + err?.message : '')
    }`)
    _prompt.outro(color.bgRed(color.white(color.bold('Lib building failed.'))))
    return FeBunViteBuilderReturnVariants.error
  }
}
// END OF MAIN

