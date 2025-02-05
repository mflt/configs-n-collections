import { _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction, 
  FePromisewithResolvers
} from '../../../../fe3/src/index.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  FeBuilderCtx, FeBuilderRunnerCtx, FeBuilderReturnCode, 
  FeBundlerConfigPrototype,
} from './types.d'
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


const catchComm = {
  framingMessage: '' as string|undefined
}

// loading buildCommonConfig and viteCommonConfigFn is delegated to the caller, as it can do it statically

export function initRunnerCtx <
  RunnerExtensionProps extends Record<string,any>|void = void,
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void,
> (
  overloadRunnerCtx: Partial<FeBuilderRunnerCtx<RunnerExtensionProps, BundlerConfig, BuilderExtensionProps>>
) {
  return {
    syncConfigSteps: {
      catchComm: new FePromisewithResolvers(),
      ...overloadRunnerCtx.syncConfigSteps
    },
    syncBuildSteps: {
      ...overloadRunnerCtx.syncBuildSteps
    },
    ...overloadRunnerCtx,
  } as Partial<FeBuilderRunnerCtx<RunnerExtensionProps, BundlerConfig, BuilderExtensionProps>>
}


export async function bulderBase <
  RunnerExtensionProps extends Record<string,any>|void = void,
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void,
> (
  runnerCtx: FeBuilderRunnerCtx<RunnerExtensionProps, BundlerConfig, BuilderExtensionProps>,
  builderCtx: FeBuilderCtx<BundlerConfig, BuilderExtensionProps>, 
): Promise<FeBuilderReturnCode> {

  prompt.intro(`${runnerCtx.builderName || '<missing name>'} builder started`)

  runnerCtx.builderCtx ??= ()=> builderCtx
  runnerCtx.resolve ??= resolve
  runnerCtx.catchComm ??= catchComm
  runnerCtx.syncConfigSteps.catchComm.resolve(true)  // resolves 

  const _catch = runnerCtx.catchComm

  try {

    _feAssertIsObject(proc)

    const builderConfig = await builderConfigPreps.pre({})
    // loadConfig({...props, catchComm: _catch})

    if (proc.ifTscistobeRan) {

      prompt.log.step(`tsc started`)
      // console.warn(builderConfig)

      _catch.framingMessage = `Failed at tsc`
      // await $`tsc -b ${buildConfig.files.tscLocalConfigJsonPath}`

      prompt.log.step(`tsc ended`)
    }

    if (builderConfig.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
      prompt.log.step(`evaluating common config`)

      _catch.framingMessage = `Failed at vite-common-config function`
      builderConfig.viteCommonConfig = props.viteCommonConfigFn // assumed to be a function if not null
        ?
          await props.viteCommonConfigFn({
            mode: 'build',
            config: builderConfig,
            resolve,
            prompt
          })
        : {}
    }

    _catch.framingMessage = 
      `Failed importing the local vite config ts (${builderConfig.files.viteLocalConfigTsPath})`
    if (builderConfig.files.viteLocalConfigTsPath) {
      prompt.log.warn('Local vite config ts can not be determined. \n' + 
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
        prompt
      })
    }

    // await viteBuild({
    //   ...viteConfig,
    //   configFile: false,
    // })

    prompt.outro('Lib building ended nicely')
    return FeBunViteBuilderReturnVariants.done

  } catch (err) {
    prompt.log.error(`${
      (_catch.framingMessage || '') + 
      (err?.message ? '\n' + err?.message : '')
    }`)
    prompt.outro(color.bgRed(color.white(color.bold('Lib building failed.'))))
    return FeBunViteBuilderReturnVariants.error
  }
}
// END OF MAIN

