import { vitexBuilder, prompt } from './entry'

if (!import.meta.main) {
  prompt.log.warn('The build script was not called directly by bun')
}

await vitexBuilder({
  builderSharedConfig: {},
  viteSharedConfigFn: null
})
