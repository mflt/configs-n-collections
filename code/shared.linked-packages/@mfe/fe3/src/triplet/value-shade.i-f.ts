import type {
  __NID, __FeDefaultKeyPropName,
} from '../_integration/types.js';
import type {
  _Fe_AnyI, FeObjectwithNamedKeyProp, FeStringKeyedCollectionObject, _Fe_AnyI_theOther,
} from '../_shared/types.js';
import type { IFeReactiveBeat, } from '../beat/beat.i-f.js';

// Frankie viewmodel core (FeVM), instead of Frankie you can say Ferrum (chemical Fe)

// The main concept behind FeVM is to provide viewmodel UI collections strongly associated with data collections
// from the underlying (business) model.
// In other words a UI driven by data (just another attempt to implement this classic UI task).
// Controlling data source is assumed as a collection of data of same type (records or docs), we call it values.
// Supported values (values in plural meaning the collection) are Arrays, Maps, WeakMaps and keyed (also iterable) objects.
// Supported value (the element of the collection) can be anything.
// This library assumes values collections as external entities and never mutes those
// -- well except a few top level optional convenience methods thru which it is handy to eg. add now values to the collection.
// It is also assumed that UI updates are triggered by changes in the underlying value collections ('values', plural).
// The FeVM library implement "parasite" collections shades and shapes where a shade or a shape extends a value
// with props which are not part of the data model but are related to the view-model level, or call it UI.
// Each value then has its corresponding shape or shade. The association of values and shades (shapes) we call the strand,
// please recall DNS for the logic of this naming.
// A shade carries props which are not part of the corresponding value and help UI processing (eg. the hash of a value),
// when a shade starts to operate specific UI related concepts (like an HTML element eg.) we designate that as shape.
// Strand knows shapes, as strands are assume to incorporate UI related templates and actions.
// (so shapes is an intermediary concept and belongs more to the internal details of FEVM conceptual structuring.)
// Strands support reactivity by implementing beats which is a home-made signal (see reactive beat),
// and shades by default carry its own beat field which is mostly not functional.
// It is assumed that the user program implements the strand class merged with a reactive store class (like Exome),
// however internally FeVM, or our UI framework based on it, the Frankie/Frankenstein do not use external store mechanisms,
// as developers using it are assumed to be opinionated about the stores of their choice. We provide a helper to merge
// a strand with your store class by utilizing a pattern suggested by the Typescript documentation.
// Note: collections are always referred to by plural words. Like we say SlicesScroller not SliceScroller.
// Also our specific speak in camel-case naming is to start prepositions (in, with) by lower case, bear with it please :)
// Though its exceptions are easily made when saying InMap or OnValueReset helps readability, as we see it.
// Also we use term entry (ery) when referring to an item or an element when it's not specifically a value or a shape.
// Term payload we use when referring to an object whose type is not important, like the portion of the value used to produce a unique hash.


export type IFeValue<
  NamedI extends _Fe_AnyI | string = _Fe_AnyI  // string is edge case, interface is the targeted subject
> = NamedI extends string ? string : NamedI;
// any interface or a named business interface,
// fully external to Fe and readonly, immutable from out pov,
// and muting externally which we are to be informed of

export type FeShadeMarkers = {
  // flags to indicate IFeItem association with values and so
  valuesById?: boolean,  // association by 'id' key present in both values and shades; not used by the lib
  valuesInMap?: boolean,  // not used by the lib, rather checked as instanceof  @TODO Are
  valuesInIdxOrder?: boolean,  // [not implemented] meaning that the raw values collection is an ordered array and markers are arranged in the same order
  valueIsString?: boolean,
  valuesInWeakmap?: boolean,
  valueShadesInArray?: boolean,
  valueShadesInWeakmap?: boolean,
};

// an intermediate form before defining an item
// _ signifies that it should not be used, use either raw or item form
export type IFeValuewithNamedKeyProp< // could've been named valueItem but Item is reserved to the derivative class
  TValue extends IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // @TODO also obj in case of a WeakMap, see IFeShade
> =
  FeObjectwithNamedKeyProp<IFeValue<TValue>, StringKeyPropName, __NID>
  ;
// any or specified interface with unique id

// collections:

export type FeValuesArray<
  TValue extends Exclude<IFeValue, string>,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // undefined 'id' has no meaning here
> =
  IFeValuewithNamedKeyProp<TValue, StringKeyPropName>[] | []
  ; // collection of keyed values

export type FeValuesMap<
  TValue extends IFeValue
> = Map<__NID, TValue>; // collection of raw values

export type FeValuesWeakmap<
  TValue extends IFeValue
> = WeakMap<_Fe_AnyI, TValue>; // collection of raw values indexed by themselves

export type FeValuesIterableObject<
  TValue extends IFeValue,
  KeyPropType extends string = string
> =
  FeStringKeyedCollectionObject<TValue, KeyPropType>
  & Iterable<TValue>;

export type FeValuesAnyIterable<
  TValue extends IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // @TODO
> = Iterable<TValue | [string, TValue]>;
//* note the tuple here

// @TODO WeakMap and Set and Shade embedded

export type FeValuesCollection< // Keyed values' collection
  TValue extends IFeValue,
  AssociationKeyTypeOrName extends string | number | _Fe_AnyI | undefined = undefined,
> =
  AssociationKeyTypeOrName extends undefined
  ?
  FeValuesMap<TValue>
  :
  AssociationKeyTypeOrName extends string
  ? // @TODO not true
  FeValuesIterableObject<TValue> | FeValuesArray<TValue, AssociationKeyTypeOrName> | FeValuesAnyIterable<TValue>
  :
  AssociationKeyTypeOrName extends _Fe_AnyI
  ?
  FeValuesWeakmap<TValue>
  :
  AssociationKeyTypeOrName extends number
  ?
  FeValuesArray<TValue>
  :
  never
  ;

// Shade

export type IFeValueShade<
  TValue extends IFeValue = IFeValue,
  StringKeyPropName extends string = __FeDefaultKeyPropName, // main purpose is to name the id prop, 'id' or 'key' or,
  TBeat extends number | __NID | { [K: string]: number } = IFeReactiveBeat['beat']
> = {
  markers?: FeShadeMarkers, // flags
  valueRef?: TValue,  // aka record, doc, business data object
  getValueRef?: (...arg: any) => TValue | undefined,
  valueId?: __NID,  // @TODO
  idxs?: {
    inValuesCollection?: number,
  },
  valueType?: string, // in case the collection carries different types, and this simple string "guard" helps the processing
  pylDigest?: __NID,  // payload / the corresponding value's content digest / fingerprint - user implemented, like eg. FVM hash (npm i fnv1a)
  groups?: __NID[], // plural, to allow a shade/shape be part of multiple groups, in case of single relationship use this tuple as a container for one
  extra?: _Fe_AnyI_theOther, // convenience keys or extra record
}
  & Partial<IFeReactiveBeat<TBeat>>
  ;

export type IFeValueShadewithNamedKeyProp<
  TValueShade extends IFeValueShade<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
> =
  FeObjectwithNamedKeyProp<TValueShade, StringKeyPropName, __NID>
  ;

// collections:

export type FeValueShadesArray<
  TValueShade extends IFeValueShade<IFeValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // 'id' is to be defined
> =
  IFeValueShadewithNamedKeyProp<
    TValueShade,
    StringKeyPropName
  >[]; // can be complicated with injecting the value's key prop name
// * assumes that the iterable thing is an id which is one of the props in shade itself, also possibly shared with the value interface so the association

export type FeValueShadesMap<
  TValueShade extends IFeValueShade,
> =
  Map<
    __NID,  // the association key, the iterable
    TValueShade
  >;

export type FeValueShadesWeakmap<
  TValueShade extends IFeValueShade,
> =
  WeakMap<
    Exclude<TValueShade['valueRef'], undefined>, // the association is by the value objects
    TValueShade
  >;  // @TODO if important to define TValue which is the association idx

/*export type FeValueShadesCollection<
  TValueShade extends IFeValueShade,
  AssocKey extends string | _Fe_AnyI | undefined = _FeDefaultKeyofId
> = TValueShade extends { markers: { valueShadesInArray: true } } // Default FeShade is Map, unlike values
  ? FeValueShadesArray<TValueShade, Exclude<AssocKey, _Fe_AnyI | undefined>>
  : TValueShade extends { markers: { valueShadesInWeakmap: true } }
  ? FeValueShadesWeakmap<TValueShade>
  : FeValueShadesMap<TValueShade>
  ;*/

export type FeValueShadesIterableObject<
  TValueShade extends IFeValueShade<IFeValue>,
  KeyPropType extends string = string
> =
  FeStringKeyedCollectionObject<TValueShade, KeyPropType>
  & Iterable<TValueShade>;
// * the iterable association key in this case is the prop of the collection not the shade itself

export type FeValueShadesAnyIterable<
  TValueShade extends IFeValueShade,
  StringKeyPropName extends string = __FeDefaultKeyPropName  // @TODO
> = Iterable<TValueShade>; // @TODO explain Object with key

export type FeValueShadesCollection< // Keyed value-shades' collection
  TValueShade extends IFeValueShade<IFeValue, Exclude<AssociationKeyTypeOrName, _Fe_AnyI | undefined>>,
  AssociationKeyTypeOrName extends string | _Fe_AnyI | undefined = undefined,
> =
  AssociationKeyTypeOrName extends undefined
  ?
  FeValueShadesMap<TValueShade>
  :
  AssociationKeyTypeOrName extends string //  Note array here is supposed to hold an association key (no number association key)
  ? // @TODO not true
  FeValueShadesIterableObject<TValueShade, AssociationKeyTypeOrName> | FeValueShadesArray<TValueShade, AssociationKeyTypeOrName> | FeValueShadesAnyIterable<TValueShade>
  :
  AssociationKeyTypeOrName extends _Fe_AnyI
  ?
  FeValueShadesWeakmap<TValueShade>
  :
  never
  ;

export type FeShadesEntryComputer<
  TValue extends IFeValue,
  TYieldedResult extends IFeValueShade<_Fe_AnyI_theOther> | IFeValue<_Fe_AnyI_theOther>,
  //* note that this may not follow the TValue, as the TValue may represent a derivative type of the shade's value, like [string,TValue]
  //* _Fe_AnyI_theOther allows to signify that this type differs from the _Fe_AnyI type behind the TValue
  KeyPropType extends string = string,
> = (
  valueEntry: TValue | null | undefined,
  key?: __NID,
  iterationIdx?: number,
) => TYieldedResult | null;


// *IFeItem* is an alternative to IFeShade interface behind a view element which can cary the business logic related model data (values)
// by obj reference, id association or in itself. It can also convey any helper property or method.
/* @TODO xox Marker is not important (?) Marker may contain valueByRef, valueById, valueByString props which or their lack of specifies the mode of association
  of this view related item with value item. */

export class CFeItem<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | number | undefined = __FeDefaultKeyPropName, // the 'id' in values if those aren't a Map
> {
  idx: string | number;

  constructor(
    public value: TValue,
    public shade: TValueShade,
    idKey?: StringKeyPropName,  // IdKey extends 'id'? string : IdKey, // @TODO
  ) {
    this.idx = this.value[idKey || 'id'];  // @TODO
  }
}

export type FeItemsArray<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | undefined = __FeDefaultKeyPropName  // 'id' is to be defined
> = CFeItem<TValue, TValueShade, StringKeyPropName>[];

export type FeWeakItemsMap<
  TValue extends IFeValue,
  TValueShade extends IFeValueShade,
> = WeakMap<TValue, TValueShade>;

export type Fe2ItemFn< // in-strand
  TValue extends IFeValue,
  TValueShade extends IFeValueShade<TValue, StringKeyPropName>,
  StringKeyPropName extends string = __FeDefaultKeyPropName
// IdKey extends string | undefined = __FeDefaultKeyPropName
> =
  (id: __NID) => CFeItem<TValue, TValueShade, StringKeyPropName>;  // infere idx number @TODO

/* FeItem legacy:
  MarkersI extends { valueByRef: true } | { valueIsString: true } ?
  _IFeValueKeyed<{ value?: TValue } & ExoticPartI, MarkersI> :  // the value field then points to a value obj or is a string
  MarkersI extends { valueById: true } ?
  TValue extends { id: _NID } ? // we assume that an IFeItem's id matches a TValue.id
  _IFeValueKeyed<ExoticPartI, MarkersI> :  // TValue is ignored otherwise than checking the id in it
  never // association by id is not possible, or use 'id' to designate your value item's id
  :
  MarkersI extends { valuesInMap: true } ?
  _IFeValueKeyed<ExoticPartI, MarkersI> :
  // * markers map associated with a map of values, and IFeItem itself eqs to IFeMarkedValue<almost{},MarkerI>
  _IFeValueKeyed<TValue & ExoticPartI, MarkersI>   // just another representation of IFeMarkedValue
  ; // thus if no valueByRef or valueById if provided than it's
//... a: the case that you use FeItems to hold your business data
//... b: valueT arg is used to point to a map, which is not value itself but a container of values associated by ids with the items
*/

// export type CStrandvalueExtender = (value: PromptStrandsvalue);

// Functions

export type FeFindInValuesCollectionFn< // in-strand
  TValue extends IFeValue,
// IdKey extends string | undefined = __FeDefaultKeyPropName
> =
  (idxOrItem: __NID | number | TValue) => TValue;  // can be an object itself in a pass tru case, @TODO see also WeakMap case
// number/idx is not implemented yet @TODO

// @TODO toShade

/* export type FeCellPyl2ShadeFn<TCellPyl extends IFeCellNothingYet> = // @TODO ?
  (idxOrPyl: __IFeCustomCell['id'] | number | TCellPyl) => __IFeCustomCell
  ; */
