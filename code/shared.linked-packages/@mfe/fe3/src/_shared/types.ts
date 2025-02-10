import type { __NID } from '../_integration/types.js';
// this file contains functions which dont strictly implement Fe concepts

export type FeTKeyof = keyof any;
export type FeTEmptyObject = Record<string,never>;  // @TODO cf {}

export type _Fe_AnyI = {  // @TODO infer keys from T maybe
  [VK: string]: any,  // @TODO unknown
};
// * @TODO cf type Record<K extends keyof any, T> = { [P in K]: T; }
export type _Fe_AnyI_theOther = {  // @TODO infer keys from T maybe
  [VK: string]: any,
};

export type FeAnyI = Record<FeTKeyof|never|symbol,unknown|never>|{}
export type FeAnyOtherI = Record<FeTKeyof,unknown|never|any>|{}

// * any kind of generic interface (an ephemeral convenience type)


export type FeStringKeyPropPartofObject <
  KeyPropName extends string, // default is assigned upstream @TODO ?
  ID = __NID
> = {
    [Key in `${KeyPropName}`]: ID
  };
// * For merging purposes

export type FeObjectwithNamedKeyProp <
  T extends _Fe_AnyI,
  KeyPropName extends string, // default is assigned upstream @TODO ?
  ID = __NID
> = T & FeStringKeyPropPartofObject<KeyPropName, ID>
// * Used as an entry of arrays

export type FeStringKeyedCollectionObject<
  T extends unknown,
  KeyPropType extends FeTKeyof = string,  // see definition of Record
> =
  Record<KeyPropType, T>
  ;
/*= {
  [Key in `${KeyPropName}`]: T  // All other props are supposed to be language internals, like symbols
};*/
// * Used in iterable object type collections in conjunction with Iterable<T>


/*
export type _FeIdxPartofI<
  Idx extends string | undefined | number, // default is assigned upstream
  T = NID
> =
  Idx extends string
  ?
  { [Key in `${Idx}`]: T }
  :
  {}  // number too
  ;
*/

/*
export type _FeIdxPartofIinclNum< // of an interface
  FeDefaultIdxKey extends string,
  Idx extends string | number | undefined = FeDefaultIdxKey, // @TODO also obj in case of a WeakMap
> =
  Idx extends number
  ? { idx?: number } // is not implemented yet
  : _FeIdxPartofI<Idx>
  ;
*/

/*export type _FeSilentIdxKey< // @TODO makes the consumer think that idx is a string if no Idx is defined
  IdKey extends string | undefined = _FeDefaultKeyPropName,
> = IdKey;

export type _FeSilentIdxKeyInclNum< // @TODO
  IdKey extends string | number | undefined = _FeDefaultKeyPropName,
> = IdKey;*/


export type FeDoesEntryFit =
  (ery: _Fe_AnyI) => boolean | undefined
  ; // tells if an entry fits the criteria for processing
