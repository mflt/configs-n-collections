import type { PackageJson } from 'type-fest'
import type { FeStringKeyedCollectionObject, FeAnyI, $fe } from '../../../../fe-kit/code/packages'
import type { IFeBsqrBaseUtilities, IFeBsqrExecMods } from '../../../../fessentials/blocks-sequencer.ts'
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
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
  BundlerLocalConfig extends BuiqLocalBundlerConfig<unknown,unknown>, // should not be undefined / unknown
  BundlerSharedConfig extends BuiqSharedBundlerConfig<unknown,unknown>,
  // * bundler is the external tool driven by us
  // * it has two slots, local and shared, see below
  // * both slots have extension subslots per stage
  BuilderExecExtensionSlots extends FeAnyI = {},
  // * can not be void as it results in never when intersects
  // * this part is for the higher order builder config part
  // / logially it extends the bundler config mainly
  // / tsc and additional configs come here
> =
  & {
    // both Bundler_Config types are basically bundler config objects with additional config options
    // for the two stages of config computations aka loading (where shared stage comes first)
    local: BundlerLocalConfig,
    shared: BundlerSharedConfig,
    [$fe]: BuiqBuilderFeConfig<BundlerSpecificFePart>
  }
  & BuilderExecExtensionSlots


export type BuiqBundlerSpecificFePartFather = {
  [TypeSignatureSlot in string as 'bundlerName']: string
}
type _BSFePF = BuiqBundlerSpecificFePartFather

export type BuiqExitCode = (typeof BuiqExitCodeVariants)[keyof typeof BuiqExitCodeVariants]

export interface IBuiqBaseUtilities extends IFeBsqrBaseUtilities {
  resolve: (path: string) => any  // @TODO any?
  prompt: IPrompt
  color: IPromptColor
}

export type BuiqConfigFilesPaths = {  // @TODO path type
  // All relative to their cwd path, which is relative to node/bun cwd (which can be a cli arg):
  cwd?: string,  // './' aka cwd is the default in local, and '..' in shared
  buiq?: string,  // builder-sequencer config, toml
  tsc?: string, // tsconfig, json
  bundler?: string, // the user package's bundler's configuration, like vite config
  additional?: string,  // like tailwind or a bunch of such things
}

export type BuiqUtilityFePart = { // does not come from a config file
  utilities: IBuiqBaseUtilities,
  meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
  packageJson?: PackageJson,
}

export type BuiqLocalFePart = {
  bundleName?: string,
  files?: BuiqConfigFilesPaths,
}
export type BuiqSharedFePart = {
  // builderLocalConfigFileType: 'toml'|'ts',
  files?: BuiqConfigFilesPaths
  cb?: {
    cwd: (params: ParamsArg) => string
  }
}
export type BuiqCommonFeConfig <
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather = _BSFePF
> =
  & BundlerSpecificFePart
  & BuiqUtilityFePart
// * all partial except utility
export type BuiqBuilderFeConfig <
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather = _BSFePF
> =
  & BuiqLocalFePart
  & BuiqSharedFePart
  & BuiqCommonFeConfig<BundlerSpecificFePart>
// * all partial except utility

export type BuiqLocalBundlerConfig <
  BundlerLocalConfig extends FeAnyI|unknown, // should not be undefined / unknown in real usecases
  LocalExtensionSlots extends FeAnyI|unknown = {}  // subslots rather
> =
  // this/descendants we load
  & BundlerLocalConfig
  & LocalExtensionSlots
  // @TODO Add TypeSignature slot

export type BuiqSharedBundlerConfig <
  BundlerSharedConfig extends FeAnyI|unknown,
  SharedExtensionSlots extends FeAnyI|unknown = {}
> =
  // this/descendants we load
  & BundlerSharedConfig
  & SharedExtensionSlots

export type BuiqBundlerConfigFnCtx <
  BundlerConfig extends BuiqSharedBundlerConfig<unknown,unknown> | BuiqLocalBundlerConfig<unknown,unknown>,
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather = _BSFePF,
> =
  & BundlerConfig
  & {
    [$fe]: BuiqBuilderFeConfig<BundlerSpecificFePart>
}

export type BuiqAbstractLocalFeConfig <
  // to be used in a builder config file
  BundlerName extends string,
  LocalBundlerConfig extends BuiqLocalBundlerConfig<unknown,unknown>,
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
> =
  & BuiqLocalFePart
  & BundlerSpecificFePart
  & {
    [BundlerNameKey in `${BundlerName}`]: LocalBundlerConfig
}
export type BuiqAbstractSharedFeConfig <
  // to be used in a builder config file
  BundlerName extends string,
  SharedBundlerConfig extends BuiqSharedBundlerConfig<unknown,unknown>,
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
> =
  & BuiqSharedFePart
  & BundlerSpecificFePart
  & {
    [BundlerNameKey in `${BundlerName}`]: SharedBundlerConfig
}

export type BuiqBuilderProps <
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
  BundlerLocalConfig extends BuiqLocalBundlerConfig<unknown,unknown>, // should not be undefined / unknown
  BundlerSharedConfig extends BuiqSharedBundlerConfig<unknown,unknown>,
> =
  & Partial<BundlerSpecificFePart>
  & {
    execMods?: BuiqEexecMods<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>
  }

export type BuiqEexecMods <
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
  BundlerLocalConfig extends BuiqLocalBundlerConfig<unknown,unknown>, // should not be undefined / unknown
  BundlerSharedConfig extends BuiqSharedBundlerConfig<unknown,unknown>,
> =
  & IFeBsqrExecMods<
      BuiqBlocksKeys,
      BuiqBuilderExecCtx<
        BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig
    >
  >
  & {
    getBuilderCtx: ()=> BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>
  }

type ParamsArg = FeStringKeyedCollectionObject<FeAnyI|string>  // command line params arg is a parsable obj

// Abstract prototypes:

// type _AbstractEntryFnProps = {
//   builderSharedConfig: BuiqAbstractSharedFeConfig<'_',{},_BSFePF>,
//   builderLocalConfig: BuiqAbstractLocalFeConfig<'_',{},_BSFePF>,
//   bundlerSharedConfigFn: _AbstractSharedConfigFn|null,
//   bundlerLocalConfigFn: _AbstractLocalConfigFn|null,
//   // initialCtx?: Partial<BuiqBuilderExecCtx<_BSFePF,{},{}>>
// }
type _AbstractBundlerConfigFn = (
  props: BuiqBundlerConfigFnCtx<{}>
) => Promise<BuiqBundlerConfigFnCtx<{}>>
