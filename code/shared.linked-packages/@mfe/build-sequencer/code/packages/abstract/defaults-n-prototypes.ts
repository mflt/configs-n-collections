import {
  FeExecSignaling
} from '../../../../fe3/src/index.ts'
import type { PkglocalConfigFilesPaths } from './types'

const __stepsKeysDonor = { // Just to have iterable keys to engage
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

export type BsqrStepsKeys = keyof typeof __stepsKeysDonor  // @TODO naming

export const _stepsKeysDonor = __stepsKeysDonor as unknown as Record<
  BsqrStepsKeys,
  FeExecSignaling<any>
>

export const baseConfig: {
  files: PkglocalConfigFilesPaths
} = {
  files: {
    bsqrlocalConfigFilePath: './builder-config.toml',
    pkgTsconfigJsonPath: './tsconfig.build.json',
  },
} as const

export const FeBuilderReturnVariants = {
  done: 0,
  error: 1,
} as const
