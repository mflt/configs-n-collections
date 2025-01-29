import type { BuildEffectiveConfig } from './types.d.ts'

export default {
  config: {
    fe: {
      addPeerDependenciestoExternals: true
    },
    buildLocalConfigFileType: 'toml', // @TODO unused
    files: {
      buildLocalConfigFilePath: './build-config.toml',
      tsLocalConfigJsonPath: './tsconfig.build.json',
      viteLocalConfigTsPath:  './vite-local-config.ts',
    },
  } satisfies Omit<
    BuildEffectiveConfig,
    'libName'|'_vite'|'_meta'|'_packageJson'|'_commonConfig'|'_localConfig'
  >
}
