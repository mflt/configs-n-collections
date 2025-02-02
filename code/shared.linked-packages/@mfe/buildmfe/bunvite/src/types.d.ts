import type { PackageJson } from 'type-fest'
import type { UserConfig, InlineConfig } from 'vite'
import * as prompt from '@clack/prompts'  // like import type, we hope

export type Prompt = typeof prompt

type ParamsArg = Object  // command line params arg is a parsable obj

type LocalConfigFilesPaths = {
  tscLocalConfigJsonPath: string,
  viteLocalConfigTsPath: string,
}
type CommonConfigFilesPaths = {
  builderLocalConfigFilePath: string,
}

export type BuilderBaseConfig = {
  files: LocalConfigFilesPaths,
  fe: {
    addPeerDependenciestoExternals: boolean,
    // changetoAltCwd: boolean,
  }
  vite?: UserConfig['build'], // common and local merges, however viteLocalConfigFn may override this
}
export type BuilderLocalConfig = 
  & BuilderBaseConfig & {
  libName: string,
}
export type BuilderCommonConfig = 
  & BuilderBaseConfig & {
  builderLocalConfigFileType: 'toml'|'ts',
  files: LocalConfigFilesPaths & CommonConfigFilesPaths,
  cb?: {
    cwd: (params: ParamsArg) => string
  }
}
export type BuilderEffectiveLocalConfig =
  & BuilderCommonConfig
  & BuilderLocalConfig & {
  builderCommonConfig: BuilderCommonConfig|{},
  viteCommonConfigFn: ViteCommonConfigFn|null,
  cwd?: string // @TODO path
}
export type BuilderEffectiveConfig = 
  & BuilderEffectiveLocalConfig /* *merged */ & {
  viteCommonConfig: UserConfig,
  viteEffectiveConfig: InlineConfig,  // merged and the common original possibly manipulated by viteLocalConfigFn
  _meta: ImportMeta,  // _ indicates externally given, probably cwd also belongs here
  _packageJson: PackageJson,
  _commonConfig: BuilderCommonConfig|{}, // not merged
  _localConfig?: BuilderLocalConfig, // not merged
}

export type ViteConfigFnBaseProps = {
  mode: 'build',
  config: BuilderEffectiveConfig,
  resolve: (path: string) => any  // @TODO any?
  prompt: Prompt
}
export type ViteCommonConfigFnProps = ViteConfigFnBaseProps
export type ViteLocalConfigFnProps = ViteConfigFnBaseProps  // No diff yet

export type ViteCommonConfigFn = (props: ViteCommonConfigFnProps) => Promise<UserConfig>
export type ViteLocalConfigFn = (props: ViteLocalConfigFnProps) => Promise<InlineConfig>
