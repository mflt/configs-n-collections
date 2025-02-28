import { FeExecSignaling, $fe } from '@mflt/_fe'
import { _BaseBuilderConfig } from '../abstract/defaults-n-prototypes.ts'
import type { VitexJobTerms } from './types.d.ts'

export type DefaultsProfileNames = 'base-vite'

export const _DefaultProfiles: Record<string,VitexJobTerms> = {
  'base-vite': {
    'vite-x': {
      addPeerDependenciestoExternals: true,
      mode: 'build',
    },
    local: { [$fe]: {
      ..._BaseBuilderConfig.local,
      files: {
        ..._BaseBuilderConfig.local.files,
        bundler: './vite-local-config.ts',
      },
    }},
    shared: { [$fe]: {
      ..._BaseBuilderConfig.shared,
      files: {
        ..._BaseBuilderConfig.shared.files,
        bundler: './vite-common-config.ts',
      },
    }}
  }
}
