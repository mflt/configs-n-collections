import type { UserConfig, InlineConfig } from 'vite'
import type { FeTEmptyObject } from '@mflt/_fe'
import type {
  BuiqBuilderJobTerms, BuiqExitCode,
  BuiqBundlerNativeConfigAndOptions, BuiqSharedSetupBundlerNativePart, BuiqAbstractOwnSetup, BuiqAbstractSharedFeSetup,
  BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms, BuiqBuilderInitSlotsAndOptions
} from '../abstract/types.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqExitCode }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type VitexJobTerms = BuiqBuilderJobTerms<
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

export type VitexBuilderSlotsAndOptions = BuiqBuilderInitSlotsAndOptions<
  VitexSpecificFeSlotsAndOptions,
  ViteLocalSetup,
  ViteSharedSetup
>

export type ViteLocalSetup = BuiqBundlerNativeConfigAndOptions<InlineConfig> // Extendable classic Vite config aka InlineConfig
export type ViteSharedSetup = BuiqSharedSetupBundlerNativePart<UserConfig>
// export type VitexConfig = BuiqBundlerConfigPrototype<ViteLocalConfig,ViteSharedConfig>

// To be used in builder config file:
export type VitexLocalBuilderSetup = BuiqAbstractOwnSetup<'vite', ViteLocalSetup, VitexSpecificFeSlotsAndOptions>
export type VitexSharedBuilderSetup = BuiqAbstractSharedFeSetup<'vite', ViteSharedSetup, VitexSpecificFeSlotsAndOptions>

export type VitexLocalConfigwFePayload = BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms<ViteLocalSetup,VitexSpecificFeSlotsAndOptions>
export type VitexSharedConfigwFePayload = BuiqBundlerConfigwOptionsAndBuilderOwnJobTerms<ViteSharedSetup,VitexSpecificFeSlotsAndOptions>

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
