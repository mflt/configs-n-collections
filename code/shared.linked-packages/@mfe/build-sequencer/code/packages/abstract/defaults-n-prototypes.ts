import { FeExecSignaling, $fe } from '@mflt/_fe'
import type {
  BuiqAbstractLocalFeSetup, BuiqAbstractSharedFeSetup, BuiqLocalBundlerSetup, BuiqBundlerSpecificFeSlotsFather
} from './types.ts'

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
  } satisfies BuiqAbstractLocalFeSetup<'<someBundler>',BuiqLocalBundlerSetup<unknown,unknown>,BuiqBundlerSpecificFeSlotsFather>,
  shared: {
    bundlerName: '<someBundler>',
    '<someBundler>': {},
    files: {
      cwd: '..'
    }
  } satisfies BuiqAbstractSharedFeSetup<'<someBundler>',BuiqLocalBundlerSetup<unknown,unknown>,BuiqBundlerSpecificFeSlotsFather>,
}

export const BuiqExitCodeVariants = {
  done: 0,
  error: 1,
} as const
