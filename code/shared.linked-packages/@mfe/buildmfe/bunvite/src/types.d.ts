import type { PackageJson } from 'type-fest'
import type { UserConfig, InlineConfig } from 'vite'
import * as prompt from '@clack/prompts'  // like import type, we hope

export type Prompt = typeof prompt

type LocalConfigFilesPaths = {
  tsLocalConfigJsonPath: string,
  viteLocalConfigTsPath: string,
}
type CommonConfigFilesPaths = {
  buildLocalConfigFilePath: string,
}

export type BuildBaseConfig = {
  files: LocalConfigFilesPaths,
  fe: {
    addPeerDependenciestoExternals: boolean
  }
  vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
}
export type BuildLocalConfig = BuildBaseConfig & {
  libName: string,
}
export type BuildCommonConfig = BuildBaseConfig & {
  buildLocalConfigFileType: 'toml',
  files: LocalConfigFilesPaths & CommonConfigFilesPaths,
}
export type BuildEffectiveConfig = BuildCommonConfig & BuildLocalConfig /* *merged */ & {
  viteCommonConfig: UserConfig,
  viteEffectiveConfig: InlineConfig,  // merged and the common original possibly manipulated by viteLocalConfigFn
  _meta: ImportMeta,  // _ indicates externally given
  _packageJson: PackageJson,
  _commonConfig: BuildCommonConfig|{}, // not merged
  _localConfig?: BuildLocalConfig, // not merged
}

export type ViteConfigFnBaseProps = {
  mode: 'build',
  config: BuildEffectiveConfig,
  resolve: (path: string) => any  // @TODO any?
  prompt: Prompt
}
export type ViteCommonConfigFnProps = ViteConfigFnBaseProps
export type ViteLocalConfigFnProps = ViteConfigFnBaseProps  // No diff yet

export type ViteCommonConfigFn = (props: ViteCommonConfigFnProps) => Promise<UserConfig>
export type ViteLocalConfigFn = (props: ViteLocalConfigFnProps) => Promise<InlineConfig>
