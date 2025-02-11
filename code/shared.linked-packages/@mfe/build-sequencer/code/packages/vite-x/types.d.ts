import type { UserConfig, InlineConfig } from 'vite'
import type {
  BuiqBuilderExecCtx, BuiqExitCode,
  BuiqConfigFilesPaths, BuiqBundlerConfigPrototype,
  BuiqLocalConfigPrototype, BuiqSharedConfigPrototype,
} from '../abstract/types.d.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqExitCode }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type BuiqVitexExecCtx = BuiqBuilderExecCtx<
  BuiqVitexConfig, {
    'vite-x': {
      mode: 'build',
      addPeerDependenciestoExternals: boolean,
      // changetoAltCwd: boolean,
    },
  }
>

export type BuiqVitexConfig = BuiqBundlerConfigPrototype<
  BuiqLocalConfigPrototype<InlineConfig,{}>,
  BuiqSharedConfigPrototype<UserConfig,{}>
>


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
// export type BuilderLocalConfig = BuiqLocalConfigPrototype<
//   BuilderBaseConfig
// >
// export type BuilderCommonConfig = BuiqSharedConfigPrototype<
//   & BuilderBaseConfig & {
//   files: BuiqConfigFilesPaths & CommonConfigFilesPaths,
// }>
// export type BuilderEffectiveLocalConfig = BuiqEffectivePkglocalConfigPrototype<
//   & BuilderCommonConfig
//   & BuilderLocalConfig & {
//   feCommonConfig: BuilderCommonConfig|{},
//   bundlerCommonConfigFn: ViteCommonConfigFn|null,
// }>
// export type BuilderEffectiveConfig = XOX BuiqExecCtxPrototype<
//   & BuilderEffectiveLocalConfig /* *merged */ & {
//   viteCommonConfig: UserConfig,
//   viteEffectiveConfig: InlineConfig,  // merged and the common original possibly manipulated by viteLocalConfigFn
//   _commonConfig: BuilderCommonConfig|{}, // not merged
//   _localConfig?: BuilderLocalConfig, // not merged
// }>

// export type ViteConfigFnBaseProps = {
//   mode: 'build',
//   config: BuilderEffectiveConfig,
// }
export type ViteCommonConfigFnProps = BuiqVitexExecCtx  // make the local part absent
export type ViteLocalConfigFnProps = BuiqVitexExecCtx  // No diff yet

export type ViteCommonConfigFn = (props: ViteCommonConfigFnProps) => Promise<UserConfig>
export type ViteLocalConfigFn = (props: ViteLocalConfigFnProps) => Promise<InlineConfig>
