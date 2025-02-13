import type { UserConfig, InlineConfig } from 'vite'
import type { $fe } from '../../../../fe3/src/index.ts'
import type {
  BuiqBuilderExecCtx, BuiqExitCode, BuiqBundlerConfigPrototype,
  BuiqLocalConfigPrototype, BuiqSharedConfigPrototype, BuiqAbstractLocalFeConfig, BuiqAbstractSharedFeConfig
} from '../abstract/types.d.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BuiqExitCode, $fe }

// export type BuiqVitexEntryProps = BuiqProps <
//   & Pick<BuilderEffectiveLocalConfig, 'builderCommonConfig'|'bundlerCommonConfigFn'|'cwd'> & {
//   defaultsProfileName?: DefaultsProfileNames,
// }>

export type VitexExecCtx = BuiqBuilderExecCtx<
  VitexConfig & {
    [$fe]: {
      mode: 'build',
      addPeerDependenciestoExternals?: boolean,
      // changetoAltCwd: boolean,
    },
  }
>

export type VitexBuilderProps = {
  builderSharedConfig: VitexSharedFeConfig|{},
  viteSharedConfigFn: VitexSharedConfigFn|null,
  initialCtx?: Partial<VitexExecCtx>
}


export type VitexLocalConfig = BuiqLocalConfigPrototype<InlineConfig,{}>
export type VitexSharedConfig = BuiqSharedConfigPrototype<UserConfig,{}>
export type VitexConfig = BuiqBundlerConfigPrototype<VitexLocalConfig,VitexSharedConfig>

// To be used in builder config file:
export type VitexLocalFeConfig = BuiqAbstractLocalFeConfig <'vite', VitexLocalConfig>
export type VitexSharedFeConfig = BuiqAbstractSharedFeConfig <'vite', VitexSharedConfig>

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

export type VitexLocalConfigFn = (props: VitexLocalConfig) => Promise<VitexLocalConfig>
export type VitexSharedConfigFn = (props: VitexSharedConfig) => Promise<VitexSharedConfig>
