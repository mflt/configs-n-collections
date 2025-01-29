import { buildvite, prompt } from '../shared.linked-packages/@mfe/buildmfe/bunvite/src/build'

import buildCommonConfig from './build-common-config.toml'
import { viteCommonConfigFn } from './vite-common-config.ts'  // @TODO what if this does not exist

if (!import.meta.main) {
  prompt.log.warn('The build script was not called directly by bun')
}

await buildvite({
  buildCommonConfig,
  viteCommonConfigFn
})
