import type { UserConfig, PluginOption, Plugin /* UserConfigExport */ } from 'vite'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'
import { defineConfig, /* searchForWorkspaceRoot */ } from 'vite'
// import { tamaguiExtractPlugin } from '@tamagui/vite-plugin'
import { fileURLToPath, URL } from 'node:url'
import * as prompt from '@clack/prompts'
import { commonConfig, type CommonConfigProps } from '../../../scripts/vite/vite.config-common'
// import localConfig from './config/app.static-config.toml'
// import { getAppConfig } from './helpers/config/getAppConfig'
import { _feIsObject } from '../../shared.linked-packages/@mfe/fe3/src'

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

  // const _mfe_site = globalThis.mfe_site

  const _commonConfig = await commonConfig({
    mode,
    // localConfig: getAppConfig(),
    meta: import.meta,
    resolve
  })

  if (_feIsObject(_commonConfig.build)) {
    _commonConfig.build!.lib = {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'YOUR_LIBRARY_NAME',
      fileName: (format) => `YOUR_LIBRARY_NAME.${format}.js`
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
