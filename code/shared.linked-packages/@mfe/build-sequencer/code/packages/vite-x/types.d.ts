import type { UserConfig, InlineConfig } from 'vite'
import type {
  BuiqBuilderCtx, BuiqExitCode,
  BuiqConfigFilesPaths, BuiqBundlerConfigPrototype,
  BuiqPkglocalConfigPrototype, BuiqSharedConfigPrototype, BuiqEffectivePkglocalConfigPrototype, BuiqEffectiveConfigPrototype
} from '../abstract/types.d.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqBuilderCtx, BuiqExitCode }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type BuiqVitexConfig = BuiqBundlerConfigPrototype<
  BuiqPkglocalConfigPrototype<InlineConfig>,
  BuiqSharedConfigPrototype<UserConfig>
>

export type FeBuilderVitexRunnerCtx = FeBuilderRunnerCtx<{
  mode: 'build',
}, BuiqVitexConfig>

export type FeBuilderVitexEntryCtx =
  & FeBuilderEntryCtx
  & Pick<FeBuilderVitexRunnerCtx,'mode'>


export type BuilderBaseConfig = {
  files: BuiqConfigFilesPaths,
  buiq: {
    addPeerDependenciestoExternals: boolean,
    // changetoAltCwd: boolean,
  }
  vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
}
export type BuilderLocalConfig = BuiqPkglocalConfigPrototype<
  BuilderBaseConfig
>
export type BuilderCommonConfig = BuiqSharedConfigPrototype<
  & BuilderBaseConfig & {
  files: BuiqConfigFilesPaths & CommonConfigFilesPaths,
}>
export type BuilderEffectiveLocalConfig = BuiqEffectivePkglocalConfigPrototype<
  & BuilderCommonConfig
  & BuilderLocalConfig & {
  feCommonConfig: BuilderCommonConfig|{},
  bundlerCommonConfigFn: ViteCommonConfigFn|null,
}>
export type BuilderEffectiveConfig = BuiqEffectiveConfigPrototype<
  & BuilderEffectiveLocalConfig /* *merged */ & {
  viteCommonConfig: UserConfig,
  viteEffectiveConfig: InlineConfig,  // merged and the common original possibly manipulated by viteLocalConfigFn
  _commonConfig: BuilderCommonConfig|{}, // not merged
  _localConfig?: BuilderLocalConfig, // not merged
}>

export type ViteConfigFnBaseProps = {
  mode: 'build',
  config: BuilderEffectiveConfig,
}
export type ViteCommonConfigFnProps = ViteConfigFnBaseProps
export type ViteLocalConfigFnProps = ViteConfigFnBaseProps  // No diff yet

export type ViteCommonConfigFn = (props: ViteCommonConfigFnProps) => Promise<UserConfig>
export type ViteLocalConfigFn = (props: ViteLocalConfigFnProps) => Promise<InlineConfig>
