// import fs from 'node:fs/promises'
import stringify from 'fast-safe-stringify'
// import { z } from "zod"
import { compile, evaluate } from '@mdx-js/mdx'
import rehypeSanitize from 'rehype-sanitize'
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from "codehike/mdx"
// import { Block, CodeBlock, parseProps } from "codehike/blocks"


const chConfig: CodeHikeConfig = {
  components: { code: "Code" },
}

const compiled = await compile(
  await Bun.file('./story.mdx').text(), {
    // rehypePlugins: [rehypeSanitize],
    // sanitizeOptions: {
    //   allowTags: '*',
    //   allowAttributes: '*'
    // },
    remarkPlugins: [[remarkCodeHike, chConfig]],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true,
  }
)

// const Schema = Block.extend({
//   steps: z.array(Block.extend({ code: CodeBlock })),
// })

// const Schema = Block.extend({
//   // steps: z.array(Block.extend({ code: CodeBlock })),
// })

// const res = parseProps(compiled, Schema)

await Bun.write('./story.jsx', String(compiled))
// console.log(String(compiled))
// console.log(compiled())
// console.log(stringify(res))
