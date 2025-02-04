import type {
  __NID, __FeDefaultKeyPropName,
} from '../_integration/types.js';
import type {
  IFeValue, FeValuesArray, FeValuesCollection, FeFindInValuesCollectionFn,
} from './value-shade.i-f.js';

export const feFindInValuesCollection = <  // generic, @TODO rename, refactor acc to the new types like keyed object
  TValue extends IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName
>(
  values: FeValuesCollection<TValue, StringKeyPropName>,
  idxOrValueSelf: Parameters<FeFindInValuesCollectionFn<TValue>>[0]
): TValue | undefined =>
  !values || !idxOrValueSelf
    ? undefined
    :
    values instanceof Map // Map or Array
      ? values.get(idxOrValueSelf as __NID)
      : typeof idxOrValueSelf === "string"  // meaning _NID, not that pyl is string
        ? (values as unknown as FeValuesArray<TValue, StringKeyPropName>)
          .find(o => (o as unknown as TValue & { id: __NID }).id === idxOrValueSelf)  // @TODO id
        : idxOrValueSelf as TValue; // pass tru won't work for simple string type of payload [non-todo]
// @TODO implement idx
// typeof idxOrPylSelf === 'number'?
//   pyl[idxOrPylSelf] :
