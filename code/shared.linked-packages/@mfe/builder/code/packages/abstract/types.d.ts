import type { PackageJson } from 'type-fest'
import * as prompt from '@clack/prompts'  // like import type, we hope
import color from 'picocolors'
import {  
  FePromisewithResolvers
} from '../../../../fe3/src/index.ts'
import type { FeBuilderReturnVariants } from './defaults'
import type { FeBundlerConfigPrototype  } from './prototype-bundler.d'

export type Prompt = typeof prompt
export type { FeBundlerConfigPrototype }

type ParamsArg = Object  // command line params arg is a parsable obj

export type FeCatchComm = {
  framingMessage: string|undefined
}

export type FeBuilderCtx <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> = 
  & {
    builderConfigPreps: {
      pre: (bc: BundlerConfig) => BundlerConfig,
      main: (bc: BundlerConfig) => BundlerConfig,
      post: (bc: BundlerConfig) => BundlerConfig,
    },
    proc: {
      preTsc: (bc: BundlerConfig) => BundlerConfig,
      ifTscistobeRan: boolean,
      build1: (bc: BundlerConfig) => BundlerConfig,
      build2: (bc: BundlerConfig) => BundlerConfig,
    },
  }
  & BundlerConfig
  & BuilderExtensionProps

export type FeBuilderRunnerCtx <
  RunnerExtensionProps extends Record<string,any>|void = void,
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> = 
  & {
    builderName: string,
    bundlerName?: string,
    getBuilderCtx: () => FeBuilderCtx<BundlerConfig,BuilderExtensionProps>
    prompt: Prompt,
    color: typeof color,
    defaultsProfileName?: string, // narrow in children
    catchComm: FeCatchComm,
    syncPrepsSteps: {
      catchComm: FePromisewithResolvers<FeCatchComm>,
      pkgLocal: FePromisewithResolvers<BundlerConfig>,
      shaded: FePromisewithResolvers<BundlerConfig>,
      config: FePromisewithResolvers<BundlerConfig>,
    },
    syncSteps: {
      pre: FePromisewithResolvers<BundlerConfig>,
      tsc: FePromisewithResolvers<BundlerConfig>,
      main: FePromisewithResolvers<BundlerConfig>,
      additional: FePromisewithResolvers<BundlerConfig>,
      post: FePromisewithResolvers<BundlerConfig>,
    }
    resolve: (path: string) => any,  // @TODO any?
  }
  & RunnerExtensionProps

export type FeBuilderEntryCtx = Pick<
  FeBuilderRunnerCtx,
  'builderName'
>

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
