import type { UserConfig, PluginOption, Plugin /* UserConfigExport */ } from 'vite'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'
import { defineConfig, /* searchForWorkspaceRoot */ } from 'vite'
// import { tamaguiExtractPlugin } from '@tamagui/vite-plugin'
import { fileURLToPath, URL } from 'node:url'
import * as prompt from '@clack/prompts'
import { commonConfig, type CommonConfigProps } from '../../shared.config/vite.config-common'
// import localConfig from './config/app.static-config.toml'
// import { getAppConfig } from './helpers/config/getAppConfig'
import { _feIsObject } from '../../shared.linked-packages/@mfe/fe3/src'
import type { LibBuildConfig } from '../../shared.config/build-config'
import packageJson, { buildConfig } from './package.json'
import { PackageJson } from 'type-fest'

const PROD = process.env.NODE_ENV === 'production'
// globalThis.mfe_site = process.env.MFT_SITE || 'eza'


const resolve = (path: string) => {
  const resolved = import.meta.resolve?.(path)
  if (!resolved) {
    throw new Error(`Not found: ${path}, maybe on wrong node version`)
  }
  return resolved.replace('file:/', '')
}


export default defineConfig(async ({ mode }) => {

  prompt.intro(`vite lib config started with mode set to '${mode}'`)

  if (!_feIsObject(buildConfig) || !buildConfig.libName) {
    console.log('Package.json buildConfig is not proper') // @TODO prompt with try
  }

  // const _mfe_site = globalThis.mfe_site

  const _commonConfig = await commonConfig({
    mode,
    config: buildConfig as LibBuildConfig,
    packageJson: packageJson as PackageJson,
    meta: import.meta,
    resolve
  })

  _commonConfig.build ??= {}

  if (_feIsObject(_commonConfig.build)) {
    _commonConfig.build!.lib = {
      entry: fileURLToPath(new URL(
        packageJson.module, import.meta.url
      )),
      name: buildConfig.libName,
      formats: ['es'], // @TODO
      fileName: format => `${buildConfig.libName}.${format}.js`
    }
  }


  // if (_feIsArray(_commonConfig.build?.rollupOptions?.external))
  //   _commonConfig.build.rollupOptions.external.push(
  //     new RegExp(`${fileURLToPath(new URL(
  //       `app/(${globalThis.mfe_site == 'eza'? 'scm' : 'eza'})`, import.meta.url // @TODO does not yet work properly
  //     )).replaceAll('(', '\\(').replaceAll(')', '\\)')}.*` ),
  //   )

  // const tamaguiPluginDup = (site: string, config: Parameters<typeof tamaguiPlugin>[0]) => {
  //   globalThis.mfe_site = site
  //   return tamaguiPlugin(config)
  // }

  // globalThis.mfe_site = 'scm'

  const selfPlugins: (Plugin|PluginOption)[] = [

    tsconfigPathsPlugin(),
  ]

  const plugins = _commonConfig.plugins as UserConfig['plugins']
  plugins?.push(...selfPlugins)

  prompt.outro('vite lib config returns')

  return {
    ..._commonConfig,
    plugins
  }

})
