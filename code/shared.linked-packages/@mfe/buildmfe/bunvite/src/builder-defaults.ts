import type { BuilderEffectiveConfig } from './types.d'

export default {
  config: {
    fe: {
      addPeerDependenciestoExternals: true
    },
    builderLocalConfigFileType: 'toml', // @TODO unused
    files: {
      builderLocalConfigFilePath: './builder-config.toml',
      tscLocalConfigJsonPath: './tsconfig.build.json',
      viteLocalConfigTsPath:  './vite-local-config.ts',
    },
  } satisfies Omit<
    BuilderEffectiveConfig,
    'libName'|'vite'|'viteCommonConfig'|'viteEffectiveConfig'|
    'builderCommonConfig'|'viteCommonConfigFn'|'cwd'|
    '_meta'|'_packageJson'|'_commonConfig'|'_localConfig'
  >
}
