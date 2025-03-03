import type { UserConfig, InlineConfig } from 'vite'
import type { FeTEmptyObject } from '@mflt/_fe'
import type {
  BdBuilderJobTerms, BdExitCode,
  BdBundlerNativeConfigExtended, BdBuilderOwnSetup_Abstract,
  BdBundlerConfigExtended_wBuilderOwnJobTerms, BdBuilderInitiator
} from '../abstract/types.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'

export type { BdExitCode }

//  Runtime (exec time) angle:

export type VitexJobTerms = BdBuilderJobTerms<
  VitexBuilderOwnSetup,
  ViteLocalConfigExtended,
  ViteSharedConfigExtended
>

export type VitexBuilderInitiator = BdBuilderInitiator<
  VitexBuilderOwnSetup,
  ViteLocalConfigExtended,
  ViteSharedConfigExtended
>

//  Setup angle (not an input for a bundler itself):

export type VitexBuilderOwnSetup =
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

// To be used in builder config file:
export type VitexLocalBuilderSetup = BdBuilderOwnSetup_Abstract<'vite', ViteLocalConfigExtended, VitexBuilderOwnSetup>
export type VitexSharedBuilderSetup = BdBuilderOwnSetup_Abstract<'vite', ViteSharedConfigExtended, VitexBuilderOwnSetup>

// Config-angle (config is external Bundler specific, with a few extensions, aka options)

export type ViteLocalConfigExtended = BdBundlerNativeConfigExtended<InlineConfig> 
// Extendable classic Vite config aka InlineConfig
export type ViteSharedConfigExtended = BdBundlerNativeConfigExtended<UserConfig>

export type VitexLocalConfigwJobTerms = BdBundlerConfigExtended_wBuilderOwnJobTerms<ViteLocalConfigExtended,VitexBuilderOwnSetup>
export type VitexSharedConfigwJobTerms = BdBundlerConfigExtended_wBuilderOwnJobTerms<ViteSharedConfigExtended,VitexBuilderOwnSetup>

export type VitexLocalConfigFn = (
  props: VitexLocalConfigwJobTerms
) => Promise<VitexLocalConfigwJobTerms>
export type VitexSharedConfigFn = (
  props: VitexSharedConfigwJobTerms
) => Promise<VitexSharedConfigwJobTerms>
