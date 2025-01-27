import type { UserConfig, PluginOption, Plugin /* UserConfigExport, searchForWorkspaceRoot */ } from 'vite'
import { ViteToml as tomlPlugin } from 'vite-plugin-toml'
// import contentCollectionsPlugin from '@content-collections/vite'
// import { fileURLToPath, URL } from 'node:url'
// import fs from 'node:fs'
import * as prompt from '@clack/prompts'
// import { getSharedConfig } from '../shared.lib/getSharedConfig'
// import type { SharedAssetsPaths } from './types/shared-assets-and-content'  // pending support with ${configDir}
// import type { _getAppConfig } from './helpers/config/_getAppConfig'
import type { LibBuildConfig } from './build-config'
import { PackageJson } from 'type-fest'

Error.stackTraceLimit = Number.POSITIVE_INFINITY

const PROD = process.env.NODE_ENV === 'production'

if (!import.meta.dirname) {
  throw new Error(`Not on proper node version (like 23+)`)
}

// const optimizeInterop = ['expo-splash-screen', '@react-navigation/elements']

export type CommonConfigProps = {
  mode: any,
  config: LibBuildConfig,
  packageJson: PackageJson,
  meta: {
    dirname: string,
    url: string
  },
  resolve: (path: string) => any
}

export const commonConfig = async (props: CommonConfigProps): Promise<UserConfig> => {

  prompt.log.step(`vite common config started`)

  // const sharedAssetsConfig = props?.localConfig?.sharedAssets
  // const sharedContentConfig = props?.localConfig?.sharedContent
  // @TODO test proper config loaded

  // const sharedAssetsPaths = JSON.parse(
  //   fs.readFileSync(sharedAssetsConfig.pathsJsonPath, 'utf8')
  //   // (await import(sharedAssetsConfig.pathsJsonPath, { with: { type: 'text' } }))?.default
  // ) as SharedAssetsPaths
  // @TODO with with: vite fails
  // @TODO check the result if proper

  const baseOptions: UserConfig = {

    define: {
      //
    },

    resolve: {
      alias: {
        // '~root-content': fileURLToPath(new URL(
        //   rootConfig.repo.sharedContent.monorepoFolderPath, props.meta.url
        // )),
      },
    },

    // ssr: {
    //   noExternal: true,
    //   external: ['@vxrn/mdx'],
    // },

    build: {
      outDir: './[build]',
      cssTarget: 'safari15',
      target: 'esnext',
      rollupOptions: {
        external: [
          ...(Object.keys(props.packageJson?.peerDependencies || {}) || []),
          ...((props.config?.vite?.rollupOptions?.external as string[]) || []),
          // 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/react/+esm',
          // fileURLToPath(new URL(
          //   'scripts/prep.shared-assets-and-content.ts', props.meta.url
          // )),
        ],
        output: {
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: '[name].js',
        }
      //   input: [ // breaks build if present
      //     // 'prepared/.local/content/collection.people.json5',
      //     // ...sharedAssetsPaths.graphics,
      //   ],
      },
    },
  }

  const prodOptions: UserConfig = {

    optimizeDeps: { // @TODO divide to common and app
      include: [
        // ...optimizeInterop,
        // 'whatwg-mimetype'
      ],
      exclude: [
        // '@shoelace-style/shoelace',
        // 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/react/+esm',
      //   'config/prepare.json5?raw'
      ],
      // needsInterop: optimizeInterop,
      esbuildOptions: {
        // loader: { '.js': 'jsx', },
        // loader:{ ".json5": "file" }
        //   plugins: [
        //     commonjsPlugin(['jsdom']),
        //   ]
      }
    },
  }

  const commonPlugins: (Plugin|PluginOption)[] = [

    // {enforce: 'pre', ...mdxjsPlugin({
    //   format: 'mdx',
    //   exclude: '*.md',
    //   include: '*.mdx'
    // })},

    tomlPlugin(),

    // contentCollectionsPlugin({
    //   configPath: './content-collections.ts'
    // }),
  ]

  prompt.log.step('vite common config returns')

  return {
    ...baseOptions,
    ...prodOptions,
    plugins: commonPlugins,
  }

}
