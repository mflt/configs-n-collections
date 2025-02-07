import {
  FeExecSignaling
} from '../../../../fe3/src/index.ts'

const __stepsKeysDonor = { // Just to have iterable keys to engage
  config_pkglocal: {},
  config_shared: {},
  config_effective: {},
  pre: {},
  tsc: {},
  main: {},
  additional: {},
  post: {},
} as const

export type FeBuilderStepsKeys = keyof typeof __stepsKeysDonor  // @TODO naming

export const _stepsKeysDonor = __stepsKeysDonor as unknown as Record<
  FeBuilderStepsKeys,
  FeExecSignaling<any>
>

export const baseConfig = {
  pkglocalConfigFileType: 'toml', // @TODO unused
  files: {
    pkglocalConfigFilePath: './builder-config.toml',
    pkgTsconfigJsonPath: './tsconfig.build.json',
  },
} as const

export const FeBuilderReturnVariants = {
  done: 0,
  error: 1,
} as const
