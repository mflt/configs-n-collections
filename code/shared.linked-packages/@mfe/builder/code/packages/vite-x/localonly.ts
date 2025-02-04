import { viteBuilder, prompt } from './src/builder'

if (!import.meta.main) {
  prompt.log.warn('The build script was not called directly by bun')
}

await viteBuilder({
  builderCommonConfig: {},
  viteCommonConfigFn: null
})
