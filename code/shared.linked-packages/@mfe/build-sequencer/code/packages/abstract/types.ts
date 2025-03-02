import type { PackageJson } from 'type-fest'
import type { FeStringKeyedCollectionObject, FeTEmptyObject } from '@mflt/_fe'
import type { IFeJbsqBaseUtilities,  IFeJbsqInitiatorExecMods } from '@mflt/feware'
import type { $builder, BdBlocksKeys, BdExitCodeVariants } from './defaults-n-prototypes.ts'
import type { BuildSequencer, IPrompt, IPromptColor } from './core.ts'
export type { BdBlocksKeys }
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
//  / input for the builder and build time definitions for the bundler and tools
// * Setup is the collection of such configs and other definition options used by builder as inputs
// * Job terms are the complete collection of setup parts which are used in build/bundle time, 
//  / this we construct during the setup stages (blocks) 
//  / and it travels from one building stage (block) to the next
//  / after the setup phase we don't speek about setup or config

//  Runtime (exec time) angle:

export type BdBuilderJobTerms <
  // the builder steps (blocks) config/options/env/context which travels
  //  / from one step (block) to another as one setup
  //  / it we construct in the setup steps/blocks
  // this/descendants evaluate as we process config inputs in sequence
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init,
  LocalBundlerNativeConfigAndOptions extends BdBundlerNativeConfigAndOptions<unknown,unknown>, 
  // * local Bundler setup
  // * should not be undefined / unknown
  // * Bundler is the external tool driven by us
  //  / it has two slots, local and shared, see below
  //  / both slots have extension subslots per stage
  SharedBundlerNativeConfigAndOptions extends BdBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
  // * Bundler setup shared between modules or parts of the codebase
  BuilderOwnJobTerms_ExtensionSlots extends FeTEmptyObject = FeTEmptyObject,
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
    [$builder]: BdBuilderOwnJobTerms<BuilderOwnJobTerms_BundlerPart>
  }
  & BuilderOwnJobTerms_ExtensionSlots

export type BdBuilderOwnJobTerms <
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init 
    = _BuilderSetup_BundlerPart_Init,
> =
  & BdBuilderSetup_LocalSlots
  & BdBuilderSetup_SharedSlots
  & BdBuilderOwnJobTerms_BasePart<BuilderOwnJobTerms_BundlerPart>
// * all partial except utility

export type BdBuilderOwnJobTerms_BasePart <
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init 
    = _BuilderSetup_BundlerPart_Init,
> =
  & BuilderOwnJobTerms_BundlerPart
  & BdBuilderOwnJobTerms_UtilityPart
// * all partial except utility

export type BdBuilderOwnJobTerms_BundlerPart < 
// to be used in a bundler specific implementation
  BuilderOwnJobTermsBundlerSpecificPart extends FeTEmptyObject|unknown = FeTEmptyObject
> = 
  & _BuilderSetup_BundlerPart_Init
  & BuilderOwnJobTermsBundlerSpecificPart

export type BdExitCode = (typeof BdExitCodeVariants)[keyof typeof BdExitCodeVariants]

export interface IBdBaseUtilities extends IFeJbsqBaseUtilities {
  // c4: FeCat4
  resolve: (path: string) => any  // @TODO any?
  prompt: IPrompt
  log: IPrompt['log']
  color: IPromptColor
}

export type BdBuilderOwnJobTerms_UtilityPart = { // does not come from a config file
  utilities: IBdBaseUtilities,
  meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
  packageJson?: PackageJson,
}

export type BdBuilderInitiator <  // @TODO
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init,
  LocalBundlerNativeConfigAndOptions extends 
    BdBundlerNativeConfigAndOptions<unknown,unknown>, 
  SharedBundlerNativeConfigAndOptions extends 
    BdBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
> =
  & Partial<BuilderOwnJobTerms_BundlerPart>
  & {
    execMods?: BdBuilderInitiatorExecMods<
      BuilderOwnJobTerms_BundlerPart,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
    >
  }

export type BdBuilderInitiatorExecMods <
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init,
  LocalBundlerNativeConfigAndOptions extends BdBundlerNativeConfigAndOptions<unknown,unknown>, 
  SharedBundlerNativeConfigAndOptions extends BdBundlerNativeConfigAndOptions<unknown,unknown>|undefined,
> =
  & IFeJbsqInitiatorExecMods<
      BdBlocksKeys,
      BdBuilderJobTerms<
        BuilderOwnJobTerms_BundlerPart,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
      >
  >
  & {
    getBuilderJobTerms: 
      ()=> 
        BdBuilderJobTerms<
          BuilderOwnJobTerms_BundlerPart,LocalBundlerNativeConfigAndOptions,SharedBundlerNativeConfigAndOptions
        >
  }


//  Setup angle (not an input for a bundler itself):

type _BuilderSetup_BundlerPart_Init = {
  [TypeSignatureSlot in string as 'bundlerName']: string
}

export type BdBaseBuilderSetup <  // includes Bundler specific slots
  BundlerName extends string,
  BundlerSetup extends BdBundlerNativeConfigAndOptions<unknown,unknown>,
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init 
    = _BuilderSetup_BundlerPart_Init
> = {
  [BaseBuilderSetupSlots in 'builderLocalSetup'|'builderSharedSetup']: 
    | BdBuilderOwnSetup_Abstract<BundlerName,BundlerSetup,BuilderOwnJobTerms_BundlerPart>
    | FeTEmptyObject
    | (BaseBuilderSetupSlots extends 'builderSharedSetup'? undefined : never)
}

export type BdBuilderOwnSetup_Abstract <
  // to be used in a builder config/setup file (toml friendly)
  //  / while providing the Bundler native config 
  BundlerName extends string,
  BundlerSetup extends BdBundlerNativeConfigAndOptions<unknown,unknown>,
  BuilderOwnJobTerms_BundlerPart extends _BuilderSetup_BundlerPart_Init 
    = _BuilderSetup_BundlerPart_Init,
> =
  & BdBuilderSetup_LocalSlots
  & BuilderOwnJobTerms_BundlerPart
  & {
    [BundlerNameKey in `${BundlerName}`]: BundlerSetup 
    // likely a partial of Bundler's native config, 
    //  / like for omitting the native config file itself

}

export type BdBuilderSetup_FilesPaths = {  // @TODO path type
  // All relative to their cwd path, which is relative to node/bun cwd (which can be a cli arg):
  cwd?: string,  // './' aka cwd is the default in local, and '..' in shared
  buid?: string,  // builder-sequencer config, toml
  tsc?: string, // tsconfig, json
  bundler?: string, // the user package's bundler's configuration, like vite config
  additional?: string|string[],  // like tailwind or a bunch of such things
}

export type BdBuilderSetup_LocalSlots = {
  // assumed to mostly be part of the local builder setup file
  // bundleName?: string, //  comes from the BdBuilderOwnJobTermsBasePart part
  files?: BdBuilderSetup_FilesPaths,
}
export type BdBuilderSetup_SharedSlots = {
  // assumed to reside in the shared build script
  // builderLocalConfigFileType: 'toml'|'ts',
  files?: BdBuilderSetup_FilesPaths
  cb?: {
    cwd: (params: ParamsArg) => string
  }
}

// Config-angle (config is external Bundler specific, with a few extensions, aka options)

export type BdBundlerNativeConfigAndOptions <
  BundlerNativeConfig extends FeTEmptyObject|unknown, 
  // like InlineConfig in case of Vite; should not be undefined / unknown in real usecases
  BundlerSetup_ExtensionOptions extends FeTEmptyObject|unknown = FeTEmptyObject
  // like if we wanted to add bundler config props which don't exist in
  //  / the native config but is to be used in the user's bundler config fn
> =
  // this/descendants we load from our own builder config
  & BundlerNativeConfig
  & BundlerSetup_ExtensionOptions
  // @TODO Add TypeSignature slot

export type BdBundlerConfig_wOptionsAndBuilderOwnJobTerms <
  // Bundler config with sugar
  // to be used in Bundler config functions as a config prop 
  //  / while providing Builder job terms
  BundlerNativeConfigAndOptions extends BdBundlerNativeConfigAndOptions<unknown,unknown>,
  BundlerJobTermsforBundlerConfig extends _BuilderSetup_BundlerPart_Init 
    = _BuilderSetup_BundlerPart_Init,
> =
  & BundlerNativeConfigAndOptions
  & {
    [$builder]: BdBuilderOwnJobTerms<BundlerJobTermsforBundlerConfig>
}

// CLI angle:

type ParamsArg = FeStringKeyedCollectionObject<FeTEmptyObject|string>  // command line params arg is a parsable obj

// Abstract prototypes:

type _BundlerConfigFn_Abstract = (
  props: BdBundlerConfig_wOptionsAndBuilderOwnJobTerms<FeTEmptyObject>
) => Promise<BdBundlerConfig_wOptionsAndBuilderOwnJobTerms<FeTEmptyObject>>
