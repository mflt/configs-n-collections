import type { UserConfig, InlineConfig } from 'vite'
import type {
  FeBuilderCtx, FeBuilderRunnerCtx, FeBuilderReturnCode, FeBuilderEntryCtx,
  PkglocalConfigFilesPaths, CommonConfigFilesPaths,
  _BuilderLocalConfig, _BuilderCommonConfig, _BuilderEffectiveLocalConfig, _BuilderEffectiveConfig
} from '../abstract/types.d'
import type {
  FeBundlerConfigPrototype
} from '../abstract/prototype-bundler.d'
import { DefaultsProfileNames } from './defaults-profiles.ts'

export type {
  FeBuilderCtx, FeBuilderReturnCode
}

// export type FeVitexEntryProps = FeBuilderProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type FeBundlerVitexConfig = FeBundlerConfigPrototype<
  InlineConfig,
  UserConfig
>

export type FeBuilderVitexRunnerCtx = FeBuilderRunnerCtx<{
  mode: 'build',
}, FeBundlerVitexConfig>

export type FeBuilderVitexEntryCtx =
  & FeBuilderEntryCtx
  & Pick<FeBuilderVitexRunnerCtx,'mode'>


export type BuilderBaseConfig = {
  files: PkglocalConfigFilesPaths,
  feb: {
    addPeerDependenciestoExternals: boolean,
    // changetoAltCwd: boolean,
  }
  vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
}
export type BuilderLocalConfig = _BuilderLocalConfig<
  BuilderBaseConfig
>
export type BuilderCommonConfig = _BuilderCommonConfig<
  & BuilderBaseConfig & {
  files: PkglocalConfigFilesPaths & CommonConfigFilesPaths,
}>
export type BuilderEffectiveLocalConfig = _BuilderEffectiveLocalConfig<
  & BuilderCommonConfig
  & BuilderLocalConfig & {
  feCommonConfig: BuilderCommonConfig|{},
  bundlerCommonConfigFn: ViteCommonConfigFn|null,
}>
export type BuilderEffectiveConfig = _BuilderEffectiveConfig<
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
