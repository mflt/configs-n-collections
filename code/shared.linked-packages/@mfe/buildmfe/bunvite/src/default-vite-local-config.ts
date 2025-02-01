import type { UserConfig, PluginOption, Plugin /* UserConfigExport */ } from 'vite'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'
import { commonConfig, type CommonConfigProps } from '../../shared.config/vite.common-config'
// import localConfig from './config/app.static-config.toml'
// import { getAppConfig } from './helpers/config/getAppConfig'
import { _feIsObject } from '../../shared.linked-packages/@mfe/fe3/src'


export async function viteConfig ({ mode }) {


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

  return {
    ..._commonConfig,
    plugins
  }

}
