import type { PackageJson } from 'type-fest'
import { $ } from 'bun'
import { parseArgs } from 'util'
import * as toml from '@std/toml'
import { mergician } from 'mergician'
import { build as viteBuild, type InlineConfig } from 'vite'
import { _feIsObject, _feAssertIsObject, _feAssertIsAsyncFunction } from '../../../fe3/src/index.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BuildEffectiveConfig, BuildLocalConfig, BuildCommonConfig, ViteCommonConfigFn, ViteCommonConfigFnProps,
  ViteLocalConfigFnProps
} from './types'
import defaults from './build-defaults.ts'

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

prompt.intro(`Vite lib build started`)

if (!_feIsObject(defaults)) {
  prompt.log.warn('Build defaults are not a valid object (see build-defaults.ts)')
}

let onTaskCancellationOrFailureMessage: string|undefined

export type FeBunViteBuildProps = {
  buildCommonConfig: BuildCommonConfig,
  viteCommonConfigFn: ViteCommonConfigFn
}

export const FeBunViteBuildReturnVariants = {
  done: 0,
  error: 1,
} as const
export type FeBunViteBuildReturnCode = (typeof FeBunViteBuildReturnVariants)[keyof typeof FeBunViteBuildReturnVariants]

export async function buildvite (props: FeBunViteBuildProps): Promise<FeBunViteBuildReturnCode> {

  try {
    onTaskCancellationOrFailureMessage = `Failed loading the common build config`
    _feAssertIsObject(
      props?.buildCommonConfig,
      {message: 'Common build config content is not valid'}
    )

    onTaskCancellationOrFailureMessage = `Failed importing proper common vite config ts`
    _feAssertIsAsyncFunction<InlineConfig,[ViteCommonConfigFnProps]>(
      props?.viteCommonConfigFn,
      {message: 'Common vite config is not a function'}
    )

    const buildConfig = await loadConfig(props.buildCommonConfig)

    prompt.log.step(`tsc started`)

    onTaskCancellationOrFailureMessage = `Failed at tsc`
    await $`tsc -b ${buildConfig.files.tsLocalConfigJsonPath}`

    prompt.log.step(`tsc ended`)

    onTaskCancellationOrFailureMessage = `Failed at vite-common-config function`
    buildConfig.viteCommonConfig = await props.viteCommonConfigFn({
      mode: 'build',
      config: buildConfig,
      resolve,
      prompt
    })

    onTaskCancellationOrFailureMessage = `Failed importing the local vite config ts (${buildConfig.files.viteLocalConfigTsPath})`
    const viteLocalConfigFn = await import(buildConfig.files.viteLocalConfigTsPath)
    _feAssertIsAsyncFunction<InlineConfig,[ViteLocalConfigFnProps]>(
      viteLocalConfigFn,
      {message: 'Local vite config is not a function'}
    )

    onTaskCancellationOrFailureMessage = `Failed at vite-local-config function`
    const viteConfig = await viteLocalConfigFn({
      mode: 'build',
      config: buildConfig,
      resolve,
      prompt
    })

    await viteBuild({
      ...viteConfig,
      configFile: false,
    })

    prompt.outro('Lib building ended nicely')
    return FeBunViteBuildReturnVariants.done

  } catch (err) {
    prompt.log.error(`${(onTaskCancellationOrFailureMessage || '') + (err?.message || '')}`)
    prompt.outro(color.bgRed(color.white(color.bold('Lib building failed.'))))
    return FeBunViteBuildReturnVariants.error
  }
}
// END OF MAIN

async function loadConfig (
  buildCommonConfig: BuildCommonConfig,
): Promise<BuildEffectiveConfig> {

  onTaskCancellationOrFailureMessage = `Failed loading the local package.json`
  const packageJson: PackageJson = await Bun.file('./package.json', {type: 'application/json'})?.json()  // no reason to make the path configurable
  if (!packageJson?.name || !packageJson?.version)  // The required fields
    throw('Local package json is not valid')

  onTaskCancellationOrFailureMessage = `Improper arguments`
  const {
    values: _argsValues,
    positionals: _argsCommands
  } = parseArgs({
    args: Bun.argv,
    options: {
      configFile: {
        type: 'string',
        short: 'c',
      },
      tsconfig: {
        type: 'string',
        short: 't',
      },
      viteconfig: {
        type: 'string',
        short: 'v',
        // multiple: true,
      }
    },
    strict: true,
    allowPositionals: true
  })

  onTaskCancellationOrFailureMessage = `Failed loading the local build config`
  let buildLocalConfig = {} as BuildLocalConfig
  const buildLocalConfigFilePath = _argsValues.configFile || buildCommonConfig.files?.buildLocalConfigFilePath || defaults?.config?.files?.buildLocalConfigFilePath
  if (!buildLocalConfigFilePath) {
    prompt.log.warn('Local build config path can not be determined. If this is not how you intended it to be, please check the defaults and other related settings.')
  } else {
    onTaskCancellationOrFailureMessage = `Failed loading the local build config ${buildLocalConfigFilePath}`
    const _rawBuildLocalConfig = await Bun.file(
      buildLocalConfigFilePath,
      {type: 'application/toml'}
    )?.text()
    if (!_rawBuildLocalConfig) {
      prompt.log.warn(`Local build config (${buildLocalConfigFilePath}) appears to convey no settings`)
    } else {
      buildLocalConfig = toml.parse(_rawBuildLocalConfig) as BuildLocalConfig
      _feAssertIsObject(
        buildLocalConfig,
        {message: 'Local build config content is not valid'}
      )
    }
  }

  const merged: BuildEffectiveConfig = mergician({ // @TODO add ability to omit common vite fields/array elements if local vite config does not work for that
    appendArrays: true,
    dedupArrays: true,
  })(
    defaults.config,
    buildCommonConfig,
    buildLocalConfig, {
      files: {
        tsLocalConfigJsonPath: _argsValues.tsconfig,
        viteLocalConfigTsPath: _argsValues.viteconfig
      } // asserts BuildConfig['files'],
    }
  )
  merged._meta = import.meta
  merged._packageJson = packageJson
  merged._commonConfig = buildCommonConfig
  merged._commonConfig = buildCommonConfig

  return merged
}
