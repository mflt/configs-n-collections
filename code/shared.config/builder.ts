import { viteBuilder, prompt } from '../shared.linked-packages/@mfe/buildmfe/bunvite/src/builder'

import builderCommonConfig from './builder-common-config.toml'
import { viteCommonConfigFn } from './vite-common-config.ts'  // @TODO what if this does not exist

if (!import.meta.main) {
  prompt.log.warn('The builder script was not called directly by bun')
}

await viteBuilder({
  builderCommonConfig,
  viteCommonConfigFn
})
