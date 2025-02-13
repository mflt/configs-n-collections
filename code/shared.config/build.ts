import { vitexBuilder, prompt, builderEntryLoaded } from '../shared.linked-packages/@mfe/build-sequencer/code/packages/vite-x/entry.ts'
import builderSharedConfig from './builder-common-config.toml'
import { viteCommonConfigFn } from './vite-common-config.ts'  // @TODO what if this does not exist

await builderEntryLoaded.tillReady

if (!import.meta.main) {
  prompt.log.warn('The builder script was not called directly by bun')
}

await vitexBuilder({
  builderSharedConfig,
  viteSharedConfigFn: viteCommonConfigFn
})
