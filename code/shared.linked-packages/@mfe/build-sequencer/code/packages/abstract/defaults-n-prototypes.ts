import { FeExecSignaling, $fe } from '../../../../_fe/code/packages'
import type { BuiqAbstractLocalFeConfig, BuiqAbstractSharedFeConfig } from './types.d.ts'

const __BlocksKeysDonor = { // Just to have iterable keys to engage
  config_a_local: {},
  config_b_shared: {},
  config_c_bundler_local: {},
  // / local bundler comes first in order to provide inputs for the shared one
  // / which like in case of vite is evaluated then first
  config_d_bundler_shared: {},
  config_e_additional: {},
  preps: {},
  compile: {},
  bundler: {},
  post: {},
} as const

export type BuiqBlocksKeys = keyof typeof __BlocksKeysDonor  // @TODO naming

export const _BlocksKeysDonor = __BlocksKeysDonor as unknown as Record<
  BuiqBlocksKeys,
  FeExecSignaling<any>  // @TODO any?
>

export const _BaseBuilderConfig = { // we omitted the $fe here
  local: {
    bundleName: '',
    files: {
      cwd: './',
      buiq: './builder-config.toml',
      tsc: './tsconfig.build.json',
    }
  } satisfies BuiqAbstractLocalFeConfig,
  shared: {
    files: {
      cwd: '..'
    }
  } satisfies BuiqAbstractSharedFeConfig,
}

export const BuiqExitCodeVariants = {
  done: 0,
  error: 1,
} as const
