import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from "codehike/mdx"
import mdx from '@mdx-js/esbuild'
import esbuild from 'esbuild'

const chConfig: CodeHikeConfig = {
  components: { code: "Code" },
}

await esbuild.build({
  entryPoints: ['./content/mdxs/story.mdx'],
  format: 'esm',
  // loader: { '.js': 'jsx', '.mdx': 'jsx' },
  outfile: './content/mdxs/services-esbuild.js',
  plugins: [mdx({
    remarkPlugins: [[remarkCodeHike, chConfig]],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    // jsx: true
  })]
})
