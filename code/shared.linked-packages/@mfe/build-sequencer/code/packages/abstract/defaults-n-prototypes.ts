import { FeExecSignaling } from '../../../../fe3/src/index.ts'
import type { BuiqConfigFilesPaths } from './types.d.ts'

const __blocksKeysDonor = { // Just to have iterable keys to engage
  config_a_pkglocal: {},
  config_b_shared: {},
  config_c_bundler_local: {},
  config_d_bundler_shared: {},
  config_e_additional: {},
  pre: {},
  tsc: {},
  main: {},
  additional: {},
  post: {},
} as const

export type BuiqBlocksKeys = keyof typeof __blocksKeysDonor  // @TODO naming

export const _blocksKeysDonor = __blocksKeysDonor as unknown as Record<
  BuiqBlocksKeys,
  FeExecSignaling<any>
>

export const baseBuilderConfig: {
  files: BuiqConfigFilesPaths
} = {
  files: {
    local: {
      buiq: './builder-config.toml',
      tsc: './tsconfig.build.json',
    }
  },
} as const

export const BuiqExitCodeVariants = {
  done: 0,
  error: 1,
} as const
