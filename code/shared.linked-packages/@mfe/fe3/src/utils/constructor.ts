
export type _Fe_Constructor = new (...args: any[]) => any;  // not: => {}
// see also the alias of the builtin InstanceType
export type _Fe_GConstructor <T = {}> = new (...args: any[]) => T;
//* https://www.typescriptlang.org/docs/handbook/mixins.html#constrained-mixins
// but the most abstract version returns any
// export interface TypeWithArgs<T, A extends any[]> extends Function { new(...args: A): T; }
export type _Fe_Constructor_Abstract = abstract new (...args: any[]) => any;
export type _Fe_GConstructor_Abstract <T = {}> = abstract new (...args: any[]) => T;

// https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
        Object.create(null)
      );
    });
  });
}


type NonConstructorKeys <T> = ({  // @TODO review !
  [P in keyof T]: T[P] extends new ()=> any ? never : T[P] extends abstract new ()=> any ? never : P
})[keyof T];
export type OmitConstructor <T> = Pick<T, NonConstructorKeys<T>>;


// _DefineProperty
// https://fettblog.eu/typescript-assertion-signatures/

type _DefineProperty_InferValue <
  Prop extends PropertyKey,
  Desc
> =
  Desc extends { get(): any, value: any } ? never :
    Desc extends { value: infer T } ? Record<Prop, T> :
      Desc extends { get(): infer T } ? Record<Prop, T> : never
;

export type _DefineProperty <
  Prop extends PropertyKey,
  Desc extends PropertyDescriptor
> =
  Desc extends { writable: any, set(val: any): any } ? never :
    Desc extends { writable: any, get(): any } ? never :
      Desc extends { writable: false } ? Readonly<_DefineProperty_InferValue<Prop, Desc>> :
        Desc extends { writable: true } ? _DefineProperty_InferValue<Prop, Desc> :
          Readonly<_DefineProperty_InferValue<Prop, Desc>>
;

export function _defineProperty <
  Obj extends object,
  Key extends PropertyKey,
  PDesc extends PropertyDescriptor
> (
  obj: Obj,
  prop: Key,
  val: PDesc
): asserts  obj is Obj & _DefineProperty<Key, PDesc>
{
  Object.defineProperty(obj, prop, val);
}
