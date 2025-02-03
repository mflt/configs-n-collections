
export const baseConfig = {
  builderLocalConfigFileType: 'toml', // @TODO unused
  files: {
    builderLocalConfigFilePath: './builder-config.toml',
    tscLocalConfigJsonPath: './tsconfig.build.json',
  },
} as const

export const FeBuilderReturnVariants = {
  done: 0,
  error: 1,
} as const

