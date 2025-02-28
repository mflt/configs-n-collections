import { vitexBuilder, prompt } from './entry.ts'

if (!import.meta.main) {
  prompt.log.warn('The build script was not called directly by bun')
}

await vitexBuilder({
  builderSharedSetup: {},
  viteSharedConfigFn: null
})
