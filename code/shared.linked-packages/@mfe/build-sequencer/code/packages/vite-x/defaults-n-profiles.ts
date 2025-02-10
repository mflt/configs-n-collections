import { baseBuilderConfig } from '../abstract/defaults-n-prototypes.ts'
import type { BuilderEffectiveConfig } from './types.d.ts'

export type DefaultsProfileNames = 'base-vite'

export default {
  'base-vite': {
    config: {
      ...baseBuilderConfig,
      buiq: {
        addPeerDependenciestoExternals: true
      },
      files: {
        ...baseBuilderConfig.files,
        bundlerLocalConfigScriptPath:  './vite-local-config.ts',
      },
    } satisfies Omit<
      BuilderEffectiveConfig,
      'libName'|'vite'|'viteCommonConfig'|'viteEffectiveConfig'|
      'builderCommonConfig'|'viteCommonConfigFn'|'cwd'|
      '_meta'|'_packageJson'|'_commonConfig'|'_localConfig'
    >
  }
}
