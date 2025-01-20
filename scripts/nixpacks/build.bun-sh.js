import { $ } from 'bun'
// Running the below referenced bun requires $PATH containing proto's bin,
// which now is set by the upstream nixpacks paths,
// then the package.json script spawns a bun runner again, and that requires
// bun installed as a node package (under nixpacks circumstances,
// where otherwise finding external bun fails)
await $`
  bun xox
`
