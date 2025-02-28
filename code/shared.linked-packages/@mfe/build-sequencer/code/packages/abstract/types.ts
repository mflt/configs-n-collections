import type { PackageJson } from 'type-fest'
import type { FeStringKeyedCollectionObject, FeTEmptyObject } from '@mflt/_fe'
import type { IFeJbsqBaseUtilities, IFeJbsqExecMods } from '@mflt/feware'
import type { $builder, BuiqBlocksKeys, BuiqExitCodeVariants } from './defaults-n-prototypes.ts'
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

// Vocabulary:
// * Config is used for external (native) configs like InlineConfig of Vite
// * Setup is the collection of such configs and other definition options used by builder
// * Job terms are the complete collection of setup parts, 
//  / this we construct during the sutup stages (blocks) 
//  / and it travels from one building stage (block) to the next

export type BuiqBuilderJobTerms <
  // the builder steps (blocks) config/options/env/context which travels
  //  / from one step (block) to another as one setup
  //  / it we construct in the setup steps/blocks
  // this/descendants evaluate as we process config inputs in sequence
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms,
  LocalBundlerNativeConfigAndOptions extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>, 
  // * local Bundler setup
  // * should not be undefined / unknown
  // * Bundler is the external tool driven by us
  //  / it has two slots, local and shared, see below
  //  / both slots have extension subslots per stage
  SharedBundlerNativeConfigAndOptions extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
  // * Bundler setup shared between modules or parts of the codebase
  BuilderJobTermsExtensionSlots extends FeTEmptyObject = FeTEmptyObject,
  // * can not be void as it results in never when intersects
  // * this part is for the higher order builder config part
  // / logially it extends the bundler config mainly
  // / tsc and additional configs come here
> =
  & {
    // both Bundler_Config types are basically bundler config objects with additional config options
    // for the two stages of config computations aka loading (where shared stage comes first)
    local: LocalBundlerNativeConfigAndOptions,
    shared: SharedBundlerNativeConfigAndOptions,
    [$builder]: BuiqBuilderOwnJobTerms<BundlerSpecificOwnJobTerms>
  }
  & BuilderJobTermsExtensionSlots


export type BuiqMinimalBundlerSpecificOwnJobTerms = {
  [TypeSignatureSlot in string as 'bundlerName']: string
}

export type BuiqExitCode = (typeof BuiqExitCodeVariants)[keyof typeof BuiqExitCodeVariants]

export interface IBuiqBaseUtilities extends IFeJbsqBaseUtilities {
  resolve: (path: string) => any  // @TODO any?
  prompt: IPrompt
  log: IPrompt['log']
  color: IPromptColor
}

export type BuiqBaseBuilderSetup <  // includes Bundler specific slots
  BundlerName extends string,
  BundlerSetup extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>,
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms 
    = BuiqMinimalBundlerSpecificOwnJobTerms
> = {
  [BaseBuilderSetupSlots in 'builderLocalSetup'|'builderSharedSetup']: 
    | BuiqAbstractOwnSetup<BundlerName,BundlerSetup,BundlerSpecificOwnJobTerms>
    | FeTEmptyObject
    | (BaseBuilderSetupSlots extends 'builderSharedSetup'? undefined : never)
}


export type BuiqBuilderSetupFilesPaths = {  // @TODO path type
  // All relative to their cwd path, which is relative to node/bun cwd (which can be a cli arg):
  cwd?: string,  // './' aka cwd is the default in local, and '..' in shared
  buiq?: string,  // builder-sequencer config, toml
  tsc?: string, // tsconfig, json
  bundler?: string, // the user package's bundler's configuration, like vite config
  additional?: string|string[],  // like tailwind or a bunch of such things
}

export type BuiqBuilderJobTermsUtilityPart = { // does not come from a config file
  utilities: IBuiqBaseUtilities,
  meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
  packageJson?: PackageJson,
}

export type BuiqBuilderOwnJobTermsLocalPart = {
  bundleName?: string,
  files?: BuiqBuilderSetupFilesPaths,
}
export type BuiqBuilderOwnJobTermsSharedPart = {
  // builderLocalConfigFileType: 'toml'|'ts',
  files?: BuiqBuilderSetupFilesPaths
  cb?: {
    cwd: (params: ParamsArg) => string
  }
}
export type BuiqBaseOwnJobTerms <
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms 
    = BuiqMinimalBundlerSpecificOwnJobTerms,
> =
  & BundlerSpecificOwnJobTerms
  & BuiqBuilderJobTermsUtilityPart
// * all partial except utility
export type BuiqBuilderOwnJobTerms <
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms 
    = BuiqMinimalBundlerSpecificOwnJobTerms,
> =
  & BuiqBuilderOwnJobTermsLocalPart
  & BuiqBuilderOwnJobTermsSharedPart
  & BuiqBaseOwnJobTerms<BundlerSpecificOwnJobTerms>
// * all partial except utility

export type BuiqBundlerNativeConfigAndOptions <
  BundlerNativeConfig extends FeTEmptyObject|unknown, 
  // like InlineConfig in case of Vite; should not be undefined / unknown in real usecases
  BundlerSetupExtensionOptions extends FeTEmptyObject|unknown = FeTEmptyObject
  // like if we wanted to add bundler config props which don't exist in
  //  / the native config but is to be used in the user's bundler config fn
> =
  // this/descendants we load from our own builder config
  & BundlerNativeConfig
  & BundlerSetupExtensionOptions
  // @TODO Add TypeSignature slot

export type BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms <
  // Bundler config with sugar
  // to be used in Bundler config functions as a config prop 
  //  / while providing Builder job terms
  BundlerNativeConfigAndOptions extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>,
  BundlerJobTermsforBundlerConfig extends BuiqMinimalBundlerSpecificOwnJobTerms 
    = BuiqMinimalBundlerSpecificOwnJobTerms,
> =
  & BundlerNativeConfigAndOptions
  & {
    [$builder]: BuiqBuilderOwnJobTerms<BundlerJobTermsforBundlerConfig>
}

export type BuiqAbstractOwnSetup <
  // to be used in a builder config file
  //  / while providing the Bundler native config 
  BundlerName extends string,
  BundlerSetup extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>,
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms 
    = BuiqMinimalBundlerSpecificOwnJobTerms,
> =
  & BuiqBuilderOwnJobTermsLocalPart
  & BundlerSpecificOwnJobTerms
  & {
    [BundlerNameKey in `${BundlerName}`]: BundlerSetup 
    // likely a partial of Bundler's native config, 
    //  / like for omitting the native config file itself

}

export type BuiqBuilderInitSlotsAndOptions <  // @TODO
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms,
  LocalBundlerNativeConfigAndOptions extends 
    BuiqBundlerNativeConfigAndOptions<unknown,unknown>, 
  SharedBundlerNativeConfigAndOptions extends 
    BuiqBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
> =
  & Partial<BundlerSpecificOwnJobTerms>
  & {
    execMods?: BuiqExecMods<
      BundlerSpecificOwnJobTerms,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
    >
  }

export type BuiqExecMods <
  BundlerSpecificOwnJobTerms extends BuiqMinimalBundlerSpecificOwnJobTerms,
  LocalBundlerNativeConfigAndOptions extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>, 
  SharedBundlerNativeConfigAndOptions extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
> =
  & IFeJbsqExecMods<
      BuiqBlocksKeys,
      BuiqBuilderJobTerms<
      BundlerSpecificOwnJobTerms,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
      >
  >
  & {
    getBuilderJobTerms: 
      ()=> 
        BuiqBuilderJobTerms<
          BundlerSpecificOwnJobTerms,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
        >
  }

type ParamsArg = FeStringKeyedCollectionObject<FeTEmptyObject|string>  // command line params arg is a parsable obj

// Abstract prototypes:

type _AbstractBundlerConfigFn = (
  props: BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms<FeTEmptyObject>
) => Promise<BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms<FeTEmptyObject>>
