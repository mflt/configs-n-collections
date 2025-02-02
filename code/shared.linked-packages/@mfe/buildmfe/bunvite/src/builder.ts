import { build as viteBuild, type InlineConfig } from 'vite'
import { _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction 
} from '../../../fe3/src/index.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BuilderEffectiveConfig, BuilderEffectiveLocalConfig, BuilderLocalConfig, BuilderCommonConfig, 
  ViteCommonConfigFn, ViteCommonConfigFnProps, ViteLocalConfigFnProps, ParamsArg, 
} from './types'
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

prompt.intro(`Vite builder started`)

const catchComm = {
  framingMessage: '' as string|undefined
}

export type FeBunViteBuilderProps = Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'viteCommonConfigFn'|'cwd'> & {
  catchComm: typeof catchComm
}
// loading buildCommonConfig and viteCommonConfigFn is delegated to the caller, as it can do it statically

export const FeBunViteBuilderReturnVariants = {
  done: 0,
  error: 1,
} as const
export type FeBunViteBuilderReturnCode = (typeof FeBunViteBuilderReturnVariants)[keyof typeof FeBunViteBuilderReturnVariants]

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
  props: FeBunViteBuilderProps
): Promise<FeBunViteBuilderReturnCode> {

  const _catch = props.catchComm || catchComm
  let viteConfig = {} as InlineConfig

  try {

    // now we parse different build and vite configs possibly coming from different sources

    const builderConfig = await loadConfig({...props, catchComm: _catch})

    prompt.log.step(`tsc started`)
    // console.warn(builderConfig)

    _catch.framingMessage = `Failed at tsc`
    // await $`tsc -b ${buildConfig.files.tscLocalConfigJsonPath}`

    prompt.log.step(`tsc ended`)

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

