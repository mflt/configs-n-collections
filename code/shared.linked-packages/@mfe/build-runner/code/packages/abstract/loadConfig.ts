import type { PackageJson } from 'type-fest'
import { $ } from 'bun'
import { parseArgs } from 'util'
import * as toml from '@std/toml'
import { mergician } from 'mergician'
import { type InlineConfig } from 'vite'
import { _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction 
} from '../../../../fe3/src/index.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  FeBuilderCtx, FeBuilderRunnerCtx
} from './types'
import defaultsProfiles from './defaults-profiles.ts'


export async function loadConfig <

> (
  builderCtx: FeBuilderCtx,
  runnerCtx: FeBuilderRunnerCtx
  // props: FeBunViteBuilderProps & Required<Pick<FeBunViteBuilderProps, 'catchComm'>>
): Promise<BuilderEffectiveConfig> {
  
  const { 
    catchComm: _catch,
    defaultsProfileName = 'base'
  } = props

  let buildLocalConfig = {} as BuilderEffectiveLocalConfig

  if (!_feIsObject(defaultsProfiles[defaultsProfileName])) {
    prompt.log.warn(
      `Builder defaults of profile named '${defaultsProfileName}' are not a valid object ` + 
      '(see defaults-profiles.ts in the package)')
  }

  // the below two configs are assumed to be loaded by the caller
  // we only check the content
  // local configs may also specify common configs

  _catch.framingMessage = 
    `Failed consuming the common (not the local one) build config (provided by the user script)`
  if (_feIsEmptyObject(props?.builderCommonConfig)) {
    prompt.log.warn('Common build config (not the local one) is empty (as provided by the user script)')
  } else {
    _feAssertIsObject(
      props?.builderCommonConfig,
      {message: 'What was provided as a common build config content is not valid (should be at least {})'}
    )
  }

  _catch.framingMessage = 
    `Failed consuming a proper common (not the local one) vite config ts (provided by the user script)`
  if (props?.viteCommonConfigFn === null) {
    prompt.log.warn('Common vite config (which isn\'t the local one) ts was not provided (by the user scipt)')
  } else {
    _feAssertIsAsyncFunction<InlineConfig,[ViteCommonConfigFnProps]>(
      props?.viteCommonConfigFn,
      {message: 'What was proviced as a common vite config is not a function (specify as null if omitted)'}
    )
  }
  
    
  _catch.framingMessage = `Improper command line arguments`
  const {
    values: _argsValues,
    positionals: _argsCommands
  } = parseArgs({
    args: Bun.argv,
    options: {
      configFile: { // local/cwd build config path
        type: 'string',
        short: 'f',
      },
      tsconfig: { // local/cwd tsc config path
        type: 'string',
        short: 't',
      },
      config: { // local/cwd vite config ts
        type: 'string',
        short: 'c',
        // multiple: true,
      },
      cwd: {
        type: 'string',
        short: 'd',
      },
      params: {
        type: 'string',  // JSON to parse
        short: 'p'
      }
    },
    strict: true,
    allowPositionals: true
  })

  const changetoCwd = 
    _argsValues.cwd 
    || props?.cwd 
    || (_argsValues.params !== undefined 
        && (props.buildCommonConfig as BuildCommonConfig)?.cb?.cwd?.(
          JSON.parse(_argsValues.params)
        ))

  const warnwithDirs = () => `meta dir: ${import.meta.dir} \n`
  + `proc cwd: ${process.cwd()} \n`
  + `requested cwd: ${changetoCwd || '-'}`
  
  if (changetoCwd && changetoCwd !== process.cwd()) {  // @TODO
    $.cwd(changetoCwd)
    if (changetoCwd !== process.cwd()) {
      prompt.log.warn('Changed cwd with suspicious results:\n' + warnwithDirs)
    }
  }

  buildLocalConfig.cwd = process.cwd()
  buildLocalConfig.buildCommonConfig = props.buildCommonConfig
  buildLocalConfig.viteCommonConfigFn = props.viteCommonConfigFn

  _catch.framingMessage = `Failed loading the local/cwd package.json`
  const packageJson: PackageJson = 
    await Bun.file(
      './package.json', 
      {type: 'application/json'}
    )?.json()
  if (!packageJson?.name || !packageJson?.version)  // The required fields
    throw new Error('Local package json is not valid \n' + warnwithDirs)

  _catch.framingMessage = `Failed loading the local build config`
  const buildLocalConfigFilePath = 
    _argsValues.configFile 
    || (props.buildCommonConfig as BuildCommonConfig)?.files?.buildLocalConfigFilePath 
    || defaults?.config?.files?.buildLocalConfigFilePath
  if (!buildLocalConfigFilePath) {
    prompt.log.warn('Local build config path can not be determined.\n' + 
      'If this is not how you intended it to be, please check the defaults and other related settings.')
  } else {
    _catch.framingMessage = `Failed loading the local build config ${buildLocalConfigFilePath}`
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

  const viteLocalConfigTsPath = 
    _argsValues.viteconfig 
    || (buildCommonConfig as BuildCommonConfig).files?.viteLocalConfigTsPath 
    || defaults?.config?.files?.viteLocalConfigTsPath

  const merged: BuildEffectiveConfig = mergician({ // @TODO add ability to omit common vite 
      // fields/array elements if local vite config does not work for that
    appendArrays: true,
    dedupArrays: true,
  })(
    defaults.config,
    buildLocalConfig.buildCommonConfig,
    buildLocalConfig, {
      files: {
        tscLocalConfigJsonPath: _argsValues.tsconfig,
        viteLocalConfigTsPath
      } // asserts BuildConfig['files'],
    }
  )
  merged._meta = import.meta
  merged._packageJson = packageJson
  merged._commonConfig = buildCommonConfig
  merged._localConfig = buildLocalConfig

  return merged
}