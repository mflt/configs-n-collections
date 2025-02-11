import { _BaseBuilderConfig } from '../abstract/defaults-n-prototypes.ts'
import type { BuiqVitexExecCtx } from './types.d.ts'

export type DefaultsProfileNames = 'base-vite'

export const _DefaultProfiles: Record<string,BuiqVitexExecCtx> = {
  'base-vite': {
    ..._BaseBuilderConfig,
    'vite-x': {
      addPeerDependenciestoExternals: true,
      mode: 'build',
    },
    local: {
      files: {
        ..._BaseBuilderConfig.local.files,
        bundler: './vite-local-config.ts',
      },
    },
    shared: {
      files: {
        ..._BaseBuilderConfig.shared.files,
        bundler: './vite-common-config.ts',
      },
    }
  }
}
