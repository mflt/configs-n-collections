import type { UserConfig, InlineConfig } from 'vite'
import type { $fe } from '@mflt/_fe'
import type {
  BuiqBuilderPassthruCtl, BuiqExitCode,
  BuiqLocalBundlerSetup, BuiqSharedBundlerSetup, BuiqAbstractLocalFeSetup, BuiqAbstractSharedFeSetup,
  BuiqBundlerConfigwFePayload, BuiqBuilderSlotsAndOptions
} from '../abstract/types.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqExitCode }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type VitexPassthruCtl = BuiqBuilderPassthruCtl<
  VitexSpecificFeSlotsAndOptions,
  ViteLocalSetup,
  ViteSharedSetup
>

export type VitexSpecificFeSlotsAndOptions =
  & VitexLocalBuilderSlots
  & VitexSharedBuilderSlots
  & {
    bundlerName: 'vite',
    mode: 'build',
    addPeerDependenciestoExternals?: boolean,
    // changetoAltCwd: boolean,
}

export type VitexLocalBuilderSlots = {
  builderLocalConfig: VitexLocalBuilderSetup|{},
  viteLocalConfigFn: VitexLocalConfigFn|null,
}

export type VitexSharedBuilderSlots = {
  builderSharedConfig: VitexSharedBuilderSetup|{},
  viteSharedConfigFn: VitexSharedConfigFn|null,
}

export type VitexBuilderSlotsAndOptions = BuiqBuilderSlotsAndOptions<
  VitexSpecificFeSlotsAndOptions,
  ViteLocalSetup,
  ViteSharedSetup
>

export type ViteLocalSetup = BuiqLocalBundlerSetup<InlineConfig> // Extendable classic Vite config aka InlineConfig
export type ViteSharedSetup = BuiqSharedBundlerSetup<UserConfig>
// export type VitexConfig = BuiqBundlerConfigPrototype<ViteLocalConfig,ViteSharedConfig>

// To be used in builder config file:
export type VitexLocalBuilderSetup = BuiqAbstractLocalFeSetup<'vite', ViteLocalSetup, VitexSpecificFeSlotsAndOptions>
export type VitexSharedBuilderSetup = BuiqAbstractSharedFeSetup<'vite', ViteSharedSetup, VitexSpecificFeSlotsAndOptions>

export type VitexLocalConfigwFePayload = BuiqBundlerConfigwFePayload<ViteLocalSetup,VitexSpecificFeSlotsAndOptions>
export type VitexSharedConfigwFePayload = BuiqBundlerConfigwFePayload<ViteSharedSetup,VitexSpecificFeSlotsAndOptions>

// export type FeBuilderVitexEntryCtx =
//   & FeBuilderEntryCtx
//   & Pick<BuiqVitexExecCtx,'mode'>


// export type BuilderBaseConfig = {
//   files: BuiqConfigFilesPaths,
//   buiq: {
//     addPeerDependenciestoExternals: boolean,
//     // changetoAltCwd: boolean,
//   }
//   vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
// }

// export type ViteLocalConfigFnProps = Omit<BuiqVitexExecCtx['local'],typeof $fe> // ie. InlineConfig & LocalExtensionProps
// export type ViteCommonConfigFnProps = Omit<BuiqVitexExecCtx['shared'],typeof $fe> // ie. UserConfig & SgaredExtensionProps

export type VitexLocalConfigFn = (
  props: VitexLocalConfigwFePayload
) => Promise<VitexLocalConfigwFePayload>
export type VitexSharedConfigFn = (
  props: VitexSharedConfigwFePayload
) => Promise<VitexSharedConfigwFePayload>
