import { plugin } from 'bun'

await plugin({
  name: 'YAML',
  async setup(build) {
    const { load } = await import("js-yaml")

    // when a .yaml file is imported...
    build.onLoad({ filter: /\.(yaml|yml)$/ }, async (args) => {

      // read and parse the file
      const text = await Bun.file(args.path).text()
      const json = load(text) as Record<string, any>

      // and returns it as a module
      return {
        exports: {
          default: json, // added this line
          ...json // and this line
        },
        loader: "object", // special loader for JS objects
      }
    })
  },
})
