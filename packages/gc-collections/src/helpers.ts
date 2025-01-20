import type { GcCollectionfromDoc_Config } from './types'

const rootPath = process.env.PWD  // @TODO no good

export function setPathsStrings (
  config: GcCollectionfromDoc_Config
) {
  return { ...config, repo: { ...config.repo,
    googleApis: {
      tokenJsonPath:
        (rootPath + config.repo.googleApis.tokenJsonPath)?.replaceAll('[','\[').replaceAll(']','\]'),
      clientConfigurationJsonPath:
        (rootPath + config.repo.googleApis.clientConfigurationJsonPath)?.replaceAll('[','\[').replaceAll(']','\]')
    },
    prepared: {
      folderPath: rootPath + config.repo.prepared.folderPath,
      sectionsOutputPath: rootPath + config.repo.prepared.sectionsOutputPath
    }
  }}
}
