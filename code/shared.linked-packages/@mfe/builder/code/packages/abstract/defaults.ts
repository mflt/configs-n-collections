
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

