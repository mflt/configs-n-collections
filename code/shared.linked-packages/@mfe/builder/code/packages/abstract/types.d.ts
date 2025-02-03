import type { PackageJson } from 'type-fest'
import * as prompt from '@clack/prompts'  // like import type, we hope
import color from 'picocolors'
import type { FeBuilderReturnVariants } from './defaults'

export type Prompt = typeof prompt

type ParamsArg = Object  // command line params arg is a parsable obj

export type FeBuilderCtx <
  BuilderConfig extends _BuilderEffectiveConfig<{}>,  // @TODO
  T extends Record<string,any>|void = void
> = 
  & {
    builderName: string,
    prompt?: Prompt,
    color?: typeof color,
    defaultsProfileName?: string, // narrow in children
    catchComm?: {
      framingMessage: string|undefined
    },
    builderConfigPreps: {
      pre: (bc: BuilderConfig) => BuilderConfig,
      main: (bc: BuilderConfig) => BuilderConfig,
      post: (bc: BuilderConfig) => BuilderConfig,
    },
    proc: {
      preTsc: (bc: BuilderConfig) => BuilderConfig,
      ifTscistobeRan: boolean,
      build1: (bc: BuilderConfig) => BuilderConfig,
      build2: (bc: BuilderConfig) => BuilderConfig,
    },
  }
  & T

export type FeBuilderReturnCode = (typeof FeBuilderReturnVariants)[keyof typeof FeBuilderReturnVariants]


export type LocalConfigFilesPaths = {
  tscLocalConfigJsonPath: string,
  bundlerLocalConfigScriptPath: string,
}
export type CommonConfigFilesPaths = {
  febLocalConfigFilePath: string,
}

export type _BuilderLocalConfig <T extends Record<string,any>> =
  & {
    libName: string,
  } 
  & T

export type _BuilderCommonConfig <T extends Record<string,any>> = 
  & {
    builderLocalConfigFileType: 'toml'|'ts',
    cb?: {
      cwd: (params: ParamsArg) => string
    }
  }
  & T

export type _BuilderEffectiveLocalConfig <T extends Record<string,any>> =
  & {
    cwd?: string // @TODO path
  } 
  & T

export type _BuilderEffectiveConfig <T extends Record<string,any>> =
  & {
    _meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
    _packageJson: PackageJson,
  } 
  & T
