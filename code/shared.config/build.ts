import type { PackageJson } from 'type-fest'
import { $ } from 'bun'
import { parseArgs } from 'util'
import * as toml from '@std/toml'
import { mergician } from 'mergician'
import { build, type InlineConfig } from 'vite'
import { _feIsObject, _feIsAsyncFunction } from '../shared.linked-packages/@mfe/fe3/src'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BuildConfig, BuildLocalConfig, BuildCommonConfig,
  ViteCommonConfigProps
} from './build-config.d.ts'
import defaults from './build-defaults.ts'
import _buildCommonConfig from './build-common-config.toml'
import { viteCommonConfigGen } from './vite-common-config.ts'  // @TODO what if this does not exist
import { Defect } from 'effect/Schema'

Error.stackTraceLimit = Number.POSITIVE_INFINITY  // @TODO why is this

const PROD = process.env.NODE_ENV === 'production'

if (!import.meta.dirname) {   // @TODO why is this
  throw new Error(`Not on proper node version (like 23+)`)
}

const resolve = (path: string) => {
  const resolved = import.meta.resolve?.(path)
  if (!resolved) {
    throw new Error(`Not found: ${path}, maybe on wrong node version`)
  }
  return resolved.replace('file:/', '')
}

const buildCommonConfig = _buildCommonConfig as BuildCommonConfig
let buildConfig = {} as BuildCommonConfig & BuildLocalConfig

prompt.intro(`Vite lib build started`)

if (!import.meta.main) {
  prompt.log.warn('The build script was not called directly by bun')
}
if (!_feIsObject(defaults)) {
  prompt.log.warn('Build defaults are not a valid object (see build-defaults.ts)')
}

let onTaskCancellationOrFailureMessage: string|undefined
try {

  onTaskCancellationOrFailureMessage = `Failed loading the local package.json`
  const packageJson: PackageJson = await Bun.file('./package.json', {type: 'application/json'})?.json()  // no reason to make the path configurable
  if (!packageJson?.name || !packageJson?.version)  // The required fields
    throw('Local package json is not valid')

  onTaskCancellationOrFailureMessage = `Failed loading the common build config`
  if (!_feIsObject(buildCommonConfig))
    throw('Common build config content is not valid')

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
      if (!_feIsObject(buildLocalConfig))
        throw('Local build config content is not valid')
    }
  }

  buildConfig = mergician({
    appendArrays: true,
    dedupArrays: true,
  })(
    defaults.config,  // @TODO Why?
    buildCommonConfig,
    buildLocalConfig, {
      files: {
        tsLocalConfigJsonPath: _argsValues.tsconfig,
        viteLocalConfigTsPath: _argsValues.viteconfig
      } // asserts BuildConfig['files'],
    }
  )

  onTaskCancellationOrFailureMessage = `Failed importing proper common vite config ts`
  if (!_feIsAsyncFunction<InlineConfig,[ViteCommonConfigProps]>(viteCommonConfigGen))
    throw('Common vite config is not a function')

  prompt.log.step(`tsc started`)

  await $`tsc -b ${_argsValues.tsconfig}`

  prompt.log.step(`tsc ended`)


  if (!_feIsObject(buildConfig) || !buildConfig.libName) {
    console.log('Package.json buildConfig is not proper') // @TODO prompt with try
  }

  const _commonConfig = await viteCommonConfigGen({
    mode: 'build',
    config: buildConfig,
    packageJson: packageJson as PackageJson,
    meta: import.meta,
    resolve
  })


  onTaskCancellationOrFailureMessage = `Failed importing the local vite config ts (${buildConfig.configFiles.viteLocalConfigTsPath})`
  const viteLocalConfigGen = await import(buildConfig.configFiles.viteLocalConfigTsPath)

  if (!_feIsAsyncFunction<InlineConfig,[{mode:string}]>(viteLocalConfigGen))
    throw('Local vite config is not a function')

  const viteLocalConfig = await viteLocalConfigGen({mode: 'build'})

  await build({
    ...config1,
    configFile: false,
  })

  prompt.outro('Lib building ended nicely')

} catch (err) {
  prompt.log.error(`${(onTaskCancellationOrFailureMessage || '') + (err?.message || '')}`)
  prompt.outro(color.bgRed(color.white(color.bold('Lib building failed.'))))
}
