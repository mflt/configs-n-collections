import {} from './types.d'

type __AbstractRecord = Record<string,any>

export type FeBundlerConfigPrototype <
  PkglocalConfig extends __AbstractRecord = __AbstractRecord,
  SharedConfig extends __AbstractRecord = __AbstractRecord,
> = {
  pkglocalConfig: PkglocalConfig,
  sharedConfig: SharedConfig,

}