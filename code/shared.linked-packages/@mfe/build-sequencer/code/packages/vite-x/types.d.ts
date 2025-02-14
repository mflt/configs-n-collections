import type { UserConfig, InlineConfig } from 'vite'
import type { $fe } from '../../../../fe3/src/index.ts'
import type {
  BuiqBuilderExecCtx, BuiqExitCode,
  BuiqLocalBundlerConfig, BuiqSharedBundlerConfig, BuiqAbstractLocalFeConfig, BuiqAbstractSharedFeConfig,
  BuiqBundlerConfigFnCtx,
} from '../abstract/types.d.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqExitCode }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type VitexExecCtx = BuiqBuilderExecCtx<
  VitexSpecificFePart,
  ViteLocalConfig,
  ViteSharedConfig
>

export type VitexSpecificFePart =
  & VitexLocalBuilderExecCtx
  & VitexSharedBuilderExecCtx
  & {
    bundlerName: 'vite',
    mode: 'build',
    addPeerDependenciestoExternals?: boolean,
    // changetoAltCwd: boolean,
}

export type VitexLocalBuilderExecCtx = {
  builderLocalConfig: VitexLocalBuilderConfig|{},
  viteLocalConfigFn: VitexLocalConfigFn|null,
}

export type VitexSharedBuilderExecCtx = {
  builderSharedConfig: VitexSharedBuilderConfig|{},
  viteSharedConfigFn: VitexSharedConfigFn|null,
}

export type VitexBuilderProps = VitexSpecificFePart // cf _AbstractEntryFnProps

export type ViteLocalConfig = BuiqLocalBundlerConfig<InlineConfig> // Extendable classic Vite config aka InlineConfig
export type ViteSharedConfig = BuiqSharedBundlerConfig<UserConfig>
// export type VitexConfig = BuiqBundlerConfigPrototype<ViteLocalConfig,ViteSharedConfig>

// To be used in builder config file:
export type VitexLocalBuilderConfig = BuiqAbstractLocalFeConfig<'vite', ViteLocalConfig, VitexSpecificFePart>
export type VitexSharedBuilderConfig = BuiqAbstractSharedFeConfig<'vite', ViteSharedConfig, VitexSpecificFePart>

export type VitexLocalConfigFnCtx = BuiqBundlerConfigFnCtx<ViteLocalConfig,VitexSpecificFePart>
export type VitexSharedConfigFnCtx = BuiqBundlerConfigFnCtx<ViteSharedConfig,VitexSpecificFePart>

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
  props: VitexLocalConfigFnCtx
) => Promise<VitexLocalConfigFnCtx>
export type VitexSharedConfigFn = (
  props: VitexSharedConfigFnCtx
) => Promise<VitexSharedConfigFnCtx>
