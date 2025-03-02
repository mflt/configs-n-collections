import { FeExecSignaling } from '@mflt/_fe'
import type {
  BdBuilderOwnSetup_Abstract, BdAbstractSharedFeSetup, BdBundlerNativeConfigAndOptions, _BdBuilderOwnJobTermsBundlerPart
} from './types.ts'

export const $builder = Symbol.for('@buidSlot');

const __BlocksKeysDonor = { // Just to have iterable keys to engage
  setup_a_local: {},
  setup_b_shared: {},
  setup_c_bundler_local: {},
  // / local bundler comes first in order to provide inputs for the shared one
  // / which like in case of vite is evaluated then first
  setup_d_bundler_shared: {},
  setup_e_additional: {},
  preps: {},
  compile: {},
  bundler: {},
  post: {},
} as const

export type BdBlocksKeys = keyof typeof __BlocksKeysDonor  // @TODO naming

export const _BlocksKeysDonor = __BlocksKeysDonor as unknown as Record<
  BdBlocksKeys,
  FeExecSignaling<any>  // @TODO any?
>

export const _BaseBuilderConfig = { // we omitted the $fe here
  local: {
    bundlerName: '<someBundler>',
    '<someBundler>': {},
    bundleName: '',
    files: {
      cwd: './',
      buid: './builder-config.toml',
      tsc: './tsconfig.build.json',
    }
  } satisfies BdBuilderOwnSetup_Abstract<'<someBundler>',BdBundlerNativeConfigAndOptions<unknown,unknown>,_BdBuilderOwnJobTermsBundlerPart>,
  shared: {
    bundlerName: '<someBundler>',
    '<someBundler>': {},
    files: {
      cwd: '..'
    }
  } satisfies BdAbstractSharedFeSetup<'<someBundler>',BdBundlerNativeConfigAndOptions<unknown,unknown>,_BdBuilderOwnJobTermsBundlerPart>,
}

export const BdExitCodeVariants = {
  done: 0,
  error: 1,
} as const
