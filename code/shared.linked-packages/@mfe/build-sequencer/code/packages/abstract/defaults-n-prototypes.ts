import { FeExecSignaling } from '@mflt/_fe'
import type {
  BuiqAbstractOwnSetup, BuiqAbstractSharedFeSetup, BuiqBundlerNativeConfigAndOptions, BuiqMinimalBundlerSpecificOwnJobTerms
} from './types.ts'

export const $builder = Symbol.for('@buiqSlot');

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

export type BuiqBlocksKeys = keyof typeof __BlocksKeysDonor  // @TODO naming

export const _BlocksKeysDonor = __BlocksKeysDonor as unknown as Record<
  BuiqBlocksKeys,
  FeExecSignaling<any>  // @TODO any?
>

export const _BaseBuilderConfig = { // we omitted the $fe here
  local: {
    bundlerName: '<someBundler>',
    '<someBundler>': {},
    bundleName: '',
    files: {
      cwd: './',
      buiq: './builder-config.toml',
      tsc: './tsconfig.build.json',
    }
  } satisfies BuiqAbstractOwnSetup<'<someBundler>',BuiqBundlerNativeConfigAndOptions<unknown,unknown>,BuiqMinimalBundlerSpecificOwnJobTerms>,
  shared: {
    bundlerName: '<someBundler>',
    '<someBundler>': {},
    files: {
      cwd: '..'
    }
  } satisfies BuiqAbstractSharedFeSetup<'<someBundler>',BuiqBundlerNativeConfigAndOptions<unknown,unknown>,BuiqMinimalBundlerSpecificOwnJobTerms>,
}

export const BuiqExitCodeVariants = {
  done: 0,
  error: 1,
} as const
