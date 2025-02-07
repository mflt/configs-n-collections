import type { PackageJson } from 'type-fest'
import type { FePromisewithResolvers } from '../../../../fe3/src/index.ts'
import type { FeBuilderReturnVariants, FeBuilderStepsKeys } from './defaults-n-prototypes.ts'
import type { FeBundlerConfigPrototype  } from './prototype-bundler.d'
import type { IPrompt, IPromptColor } from './core.ts'
export type { FeBundlerConfigPrototype, FeBuilderStepsKeys }
export type { IPrompt, IPromptColor }

type ParamsArg = Object  // command line params arg is a parsable obj

export type FeBuilderCtx <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> =
  & {
    configSteps: {
      pkgLocal: (bc: BundlerConfig) => BundlerConfig,
      shared: (bc: BundlerConfig) => BundlerConfig,
      final: (bc: BundlerConfig) => BundlerConfig,
    },
    buildSteps: {
      preTsc: (bc: BundlerConfig) => BundlerConfig,
      skipTsc: boolean,
      pre: (bc: BundlerConfig) => BundlerConfig,
      main: (bc: BundlerConfig) => BundlerConfig,
      post: (bc: BundlerConfig) => BundlerConfig,
    },
  }
  & BundlerConfig
  & BuilderExtensionProps


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
