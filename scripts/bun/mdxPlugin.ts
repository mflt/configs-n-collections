import Bun, { plugin } from 'bun'
import mdx from '@mdx-js/esbuild'

Bun.plugin(mdx()) // does not work
