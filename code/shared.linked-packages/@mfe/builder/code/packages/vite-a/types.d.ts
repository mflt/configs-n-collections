import type { UserConfig, InlineConfig } from 'vite'
import type {
  FeBuilderCtx, FeBuilderReturnCode,
  LocalConfigFilesPaths, CommonConfigFilesPaths, 
  _BuilderLocalConfig, _BuilderCommonConfig, _BuilderEffectiveLocalConfig, _BuilderEffectiveConfig
} from '../abstract/types.d'
import { DefaultsProfileNames } from './defaults-profiles.ts'

export type { 
  FeBuilderCtx, FeBuilderReturnCode
}

export type FeViteBuilderProps = FeBuilderProps < 
  & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
  defaultsProfileName?: DefaultsProfileNames,
}>


export type BuilderBaseConfig = {
  files: LocalConfigFilesPaths,
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
  files: LocalConfigFilesPaths & CommonConfigFilesPaths,
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
  resolve: (path: string) => any  // @TODO any?
  prompt: Prompt
}
export type ViteCommonConfigFnProps = ViteConfigFnBaseProps
export type ViteLocalConfigFnProps = ViteConfigFnBaseProps  // No diff yet

export type ViteCommonConfigFn = (props: ViteCommonConfigFnProps) => Promise<UserConfig>
export type ViteLocalConfigFn = (props: ViteLocalConfigFnProps) => Promise<InlineConfig>
