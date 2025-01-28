import type { PackageJson } from 'type-fest'
import type { UserConfig,} from 'vite'

type LocalConfigFilesPaths = {
  tsLocalConfigJsonPath: string,
  viteLocalConfigTsPath: string,
}

type CommonConfigFilesPaths = {
  buildLocalConfigFilePath: string,
}

export type BuildLocalConfig = {
  libName: string,
  files: LocalConfigFilesPaths,
  mfe: {
    addPeerDependenciestoExternals: boolean
  }
  vite?: UserConfig['build'],
}

export type BuildCommonConfig = {
  files: LocalConfigFilesPaths & CommonConfigFilesPaths,
}

export type BuildConfig = BuildCommonConfig & BuildLocalConfig

export type ViteCommonConfigProps = {
  mode: 'build',
  config: BuildConfig,
  packageJson: PackageJson,
  meta: {
    dirname: string,
    url: string
  },
  resolve: (path: string) => any
}
