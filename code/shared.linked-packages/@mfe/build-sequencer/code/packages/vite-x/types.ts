import type { UserConfig, InlineConfig } from 'vite'
import type { FeTEmptyObject } from '@mflt/_fe'
import type {
  BdBuilderJobTerms, BdExitCode,
  BdBundlerNativeConfigAndOptions, BdSharedSetupBundlerNativePart, BdBuilderOwnSetup_Abstract, BdAbstractSharedFeSetup,
  BdBundlerConfig_wOptionsAndBuilderOwnJobTerms, BdBuilderInitiator
} from '../abstract/types.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BdExitCode }

// export type BdVitexEntryProps = BdProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type VitexJobTerms = BdBuilderJobTerms<
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
  builderLocalSetup: VitexLocalBuilderSetup|FeTEmptyObject,
  viteLocalConfigFn: VitexLocalConfigFn|null,
}

export type VitexSharedBuilderSlots = {
  builderSharedSetup: VitexSharedBuilderSetup|FeTEmptyObject,
  viteSharedConfigFn: VitexSharedConfigFn|null,
}

export type VitexBuilderSlotsAndOptions = BdBuilderInitiator<
  VitexSpecificFeSlotsAndOptions,
  ViteLocalSetup,
  ViteSharedSetup
>

export type ViteLocalSetup = BdBundlerNativeConfigAndOptions<InlineConfig> // Extendable classic Vite config aka InlineConfig
export type ViteSharedSetup = BdSharedSetupBundlerNativePart<UserConfig>
// export type VitexConfig = BdBundlerConfigPrototype<ViteLocalConfig,ViteSharedConfig>

// To be used in builder config file:
export type VitexLocalBuilderSetup = BdBuilderOwnSetup_Abstract<'vite', ViteLocalSetup, VitexSpecificFeSlotsAndOptions>
export type VitexSharedBuilderSetup = BdAbstractSharedFeSetup<'vite', ViteSharedSetup, VitexSpecificFeSlotsAndOptions>

export type VitexLocalConfigwFePayload = BdBundlerConfig_wOptionsAndBuilderOwnJobTerms<ViteLocalSetup,VitexSpecificFeSlotsAndOptions>
export type VitexSharedConfigwFePayload = BdBundlerConfig_wOptionsAndBuilderOwnJobTerms<ViteSharedSetup,VitexSpecificFeSlotsAndOptions>

// export type FeBuilderVitexEntryCtx =
//   & FeBuilderEntryCtx
//   & Pick<BdVitexExecCtx,'mode'>


// export type BuilderBaseConfig = {
//   files: BdConfigFilesPaths,
//   buid: {
//     addPeerDependenciestoExternals: boolean,
//     // changetoAltCwd: boolean,
//   }
//   vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
// }

// export type ViteLocalConfigFnProps = Omit<BdVitexExecCtx['local'],typeof $fe> // ie. InlineConfig & LocalExtensionProps
// export type ViteCommonConfigFnProps = Omit<BdVitexExecCtx['shared'],typeof $fe> // ie. UserConfig & SgaredExtensionProps

export type VitexLocalConfigFn = (
  props: VitexLocalConfigwFePayload
) => Promise<VitexLocalConfigwFePayload>
export type VitexSharedConfigFn = (
  props: VitexSharedConfigwFePayload
) => Promise<VitexSharedConfigwFePayload>
