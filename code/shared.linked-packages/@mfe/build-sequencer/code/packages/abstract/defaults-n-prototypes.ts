import { FeExecSignaling } from '../../../../fe3/src/index.ts'
import type { BuiqBundlerConfigPrototype } from './types.d.ts'

const __BlocksKeysDonor = { // Just to have iterable keys to engage
  config_a_local: {},
  config_b_shared: {},
  config_c_bundler_local: {},
  config_d_bundler_shared: {},
  config_e_additional: {},
  pre: {},
  tsc: {},
  bundler: {},
  additional: {},
  post: {},
} as const

export type BuiqBlocksKeys = keyof typeof __BlocksKeysDonor  // @TODO naming

export const _BlocksKeysDonor = __BlocksKeysDonor as unknown as Record<
  BuiqBlocksKeys,
  FeExecSignaling<any>  // @TODO any?
>

export const _BaseBuilderConfig: BuiqBundlerConfigPrototype = {
  local: {
    bundleName: '',
    files: {
      cwd: './',
      buiq: './builder-config.toml',
      tsc: './tsconfig.build.json',
    }
  },
  shared: {
    files: {
      cwd: '..'
    }
  }
}

export const BuiqExitCodeVariants = {
  done: 0,
  error: 1,
} as const
