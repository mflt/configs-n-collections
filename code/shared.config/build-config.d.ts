import type { UserConfig,} from 'vite'

export type LibBuildConfig = {
  "libName": string,
  "vite"?: UserConfig['build'],
}