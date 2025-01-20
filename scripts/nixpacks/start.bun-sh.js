import { $ } from 'bun'
// is ran from railway.json
const protoPaths = '~/.proto/bin:~/.proto/shims'
const startEza = $`
  export PATH="${protoPaths}:$PATH"
  bun xox
`
const startEzSm = $`
  export PATH="${protoPaths}:$PATH"
  bun xox
`
await Promise.allSettled([
  startEzSm
])
