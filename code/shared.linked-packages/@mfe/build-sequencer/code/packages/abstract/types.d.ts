import type { PackageJson } from 'type-fest'
import type { FePromisewithResolvers, FeStringKeyedCollectionObject, FeAnyI } from '../../../../fe3/src/index.ts'
import type { FeCatchComm, IFeBsqrBaseUtilities } from '../../../../fessentials/blocks-sequencer.ts'
import type { BuiqBlocksKeys, BuiqExitCodeVariants } from './defaults-n-prototypes.ts'
import type { BuildSequencer, IPrompt, IPromptColor } from './core.ts'
export type { BuiqBlocksKeys }
export type { BuildSequencer, IPrompt, IPromptColor }

export type BuiqBundlerConfigPrototype <
  PkglocalConfig extends BuiqPkglocalConfigPrototype = BuiqPkglocalConfigPrototype,
  SharedConfig extends BuiqSharedConfigPrototype = BuiqSharedConfigPrototype,
> = {
  pkglocalConfig: PkglocalConfig,
  sharedConfig: SharedConfig,
}

export type BuiqExitCode = (typeof BuiqExitCodeVariants)[keyof typeof BuiqExitCodeVariants]

export type BuiqBuilderCtx <
  BundlerConfig extends BuiqBundlerConfigPrototype = BuiqBundlerConfigPrototype,  // bundler is the external tool driven by us
  BuilderExtensionProps extends FeAnyI|void = void
  // * this part is for the higher order builder config part
  // / logially it extends the bundler config mainly
> =
  & BundlerConfig
  & BuilderExtensionProps

export interface IBuiqBaseUtilities extends IFeBsqrBaseUtilities {
  resolve: (path: string) => any  // @TODO any?
  prompt: IPrompt
  color: IPromptColor
}

// export type FeBuilderEntryCtx = Pick<
//   FeBuilderRunnerCtx,
//   'builderName'
// >

export type BuiqConfigFilesPaths = {
  local?: {
    buiq?: string,  // @TODO path type
    tsc?: string,
    bundler?: string,
  },
  shared?: {
    buiq?: string,
    tsc?: string,
    bundler?: string,
  }
}

export type BuiqPkglocalConfigPrototype <T extends FeAnyI = FeAnyI> =
  & {
    bundleName: string,
  }
  & T

type ParamsArg = FeStringKeyedCollectionObject<FeAnyI|string>  // command line params arg is a parsable obj

export type BuiqSharedConfigPrototype <T extends FeAnyI = FeAnyI> =
  & {
    // builderLocalConfigFileType: 'toml'|'ts',
    cb?: {
      cwd: (params: ParamsArg) => string
    }
  }
  & T

export type BuiqEffectivePkglocalConfigPrototype <T extends FeAnyI> =
  & {
    cwd?: string // @TODO path
  }
  & T

export type BuiqEffectiveConfigPrototype <T extends FeAnyI> =
  & {
    _meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
    _packageJson: PackageJson,
  }
  & T
