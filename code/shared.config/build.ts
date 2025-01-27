import { $ } from 'bun'
import { build } from 'vite'
import * as prompt from '@clack/prompts'
import { viteConfig } from '../packages/gc-collections/vite.config'

// globalThis.globalTest = 'ANA'

prompt.intro(`vite lib build started`)

prompt.log.step(`tsc started`)

await $`tsc -b tsconfig.build.json`

prompt.log.step(`tsc ended`)

const config1 = await viteConfig({mode: 'build'})

await build({
  ...config1,
  configFile: false,
})

prompt.outro('vite lib ended')
