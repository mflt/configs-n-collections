import { baseConfig } from '../entry/defaults'
import type { BuilderEffectiveConfig } from './types'

export type DefaultsProfileNames = 'base-vite'

export default {
  'base-vite': {
    config: {
      ...baseConfig,
      fe: {
        addPeerDependenciestoExternals: true
      },
      builderLocalConfigFileType: 'toml', // @TODO unused
      files: {
        ...baseConfig.files,
        bundlerLocalConfigTsPath:  './vite-local-config.ts',
      },
    } satisfies Omit<
      BuilderEffectiveConfig,
      'libName'|'vite'|'viteCommonConfig'|'viteEffectiveConfig'|
      'builderCommonConfig'|'viteCommonConfigFn'|'cwd'|
      '_meta'|'_packageJson'|'_commonConfig'|'_localConfig'
    >
  }
}
