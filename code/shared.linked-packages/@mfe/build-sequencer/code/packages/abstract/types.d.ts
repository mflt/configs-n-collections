import type { PackageJson } from 'type-fest'
import type { FeStringKeyedCollectionObject, FeAnyI, $fe } from '../../../../fe3/src/index.ts'
import type { IFeBsqrBaseUtilities } from '../../../../fessentials/blocks-sequencer.ts'
import type { BuiqBlocksKeys, BuiqExitCodeVariants } from './defaults-n-prototypes.ts'
import type { BuildSequencer, IPrompt, IPromptColor } from './core.ts'
export type { BuiqBlocksKeys }
export type { BuildSequencer, IPrompt, IPromptColor }


// # Legend:
// Builder, or builder package/lib is the higher order entity which is decendent of BuildSequencer
// builder lib is driven and configured by the end user in his/her/their caller script.
// BuildSequencer implements built-in functions.
// The builder package/lib utilizes the level 1 async promises based blocks.
// Something higher, like a wrapper around the lib or the caller script can define blocks as functions.
// Bundler is an external tool which builder is driving, it is assumed to have a local config,
// and a shared config.
// Tsc is presumed to be part of the scenario and it precludes the bundler runner block.
// The additional block comes after the bundler run, it can be anything, and its configuration is part of
// BuilderExtensionProps (no type prescriptions)

export type BuiqBuilderExecCtx <
  // the builder context
  // this/descendants evaluate as we process config inputs in sequence
  BundlerConfig extends BuiqBundlerConfigPrototype = BuiqBundlerConfigPrototype,
  // * bundler is the external tool driven by us
  // * it has two slots, local and shared, see below
  BuilderExecExtensionProps extends FeAnyI|void = {}
  // * this part is for the higher order builder config part
  // / logially it extends the bundler config mainly
  // / tsc and additional configs come here
> =
  & BundlerConfig // local and shared
  & BuilderExecExtensionProps

export type BuiqBundlerConfigPrototype <
  LocalConfig extends BuiqLocalConfigPrototype = BuiqLocalConfigPrototype,
  SharedConfig extends BuiqSharedConfigPrototype = BuiqSharedConfigPrototype,
> = {
  // both input types are basically bundler config objects with additional config options
  // for the two stages of config computations aka loading (where shared stage comes first)
  local: LocalConfig, // omitting $fe couldve been adequate
  shared: SharedConfig,
  [$fe]: BuiqFeOnlyConfig
}

export interface IBuiqBaseUtilities extends IFeBsqrBaseUtilities {
  resolve: (path: string) => any  // @TODO any?
  prompt: IPrompt
  color: IPromptColor
}

export type BuiqExitCode = (typeof BuiqExitCodeVariants)[keyof typeof BuiqExitCodeVariants]

type BuiqAbstractEntryFnProps = {
  builderCommonConfig: BuiqAbstractSharedFeConfig,
  bundlerCommonConfigFn: BuiqAbstractSharedConfigFn|null,
  initialCtx?: Partial<BuiqBuilderExecCtx>
}
type BuiqAbstractSharedConfigFn = (props: BuiqSharedConfigPrototype) => Promise<BuiqSharedConfigPrototype>

export type BuiqConfigFilesPaths = {  // @TODO path type
  // All relative to their cwd path, which is relative to node/bun cwd (which can be a cli arg):
  cwd?: string,  // './' aka cwd is the default in local, and '..' in shared
  buiq?: string,  // builder-sequencer config, toml
  tsc?: string, // tsconfig, json
  bundler?: string, // the user package's bundler's configuration, like vite config
  additional?: string,  // like tailwind or a bunch of such things
}

export type BuiqLocalFeOnlyConfig = {
  bundleName?: string,
  files?: BuiqConfigFilesPaths,
}
export type BuiqSharedFeOnlyConfig = {
  // builderLocalConfigFileType: 'toml'|'ts',
  files?: BuiqConfigFilesPaths
  cb?: {
    cwd: (params: ParamsArg) => string
  }
}
export type BuiqFeOnlyConfig = BuiqSharedFeOnlyConfig & BuiqLocalFeOnlyConfig & {
  meta?: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
  packageJson?: PackageJson,
}

export type BuiqAbstractLocalFeConfig <
  BundlerName extends string = never,
  BundlerLocalConfig extends BuiqLocalConfigPrototype = BuiqLocalConfigPrototype,
> = BuiqLocalFeOnlyConfig & {
  [BundlerNameKey in `${BundlerName}`]: BundlerLocalConfig  // used in builder config file
}
export type BuiqAbstractSharedFeConfig <
  BundlerName extends string = never,
  BundlerSharedConfig extends FeAnyI = FeAnyI,
> = BuiqSharedFeOnlyConfig & {
  [BundlerNameKey in `${BundlerName}`]: BundlerSharedConfig  // used in builder config file
}

export type BuiqLocalConfigPrototype <
  BundlerLocalConfig extends FeAnyI = FeAnyI, // should not be undefined / unknown
  LocalExtensionProps extends FeAnyI|void = {}
> =
// this/descendants we load
  & BundlerLocalConfig
  & {
    [$fe]?: BuiqFeOnlyConfig
  }
  & LocalExtensionProps

export type BuiqSharedConfigPrototype <
  BundlerSharedConfig extends FeAnyI = FeAnyI,
  SharedExtensionProps extends FeAnyI|void = {}
> =
// this/descendants we load
  & BundlerSharedConfig
  & {
    [$fe]?: BuiqFeOnlyConfig
  }
  & SharedExtensionProps

type ParamsArg = FeStringKeyedCollectionObject<FeAnyI|string>  // command line params arg is a parsable obj
