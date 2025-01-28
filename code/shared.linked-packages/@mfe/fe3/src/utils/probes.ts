
export const _feIsNumber = (num: number): num is number => +num === +num;
export const _feIsString = (that: unknown): that is string|String => typeof that === 'string' || that instanceof String;
export const _feIsMap = <K, V> (that: unknown): that is Map<K, V> => that instanceof Map;
export const _feIsWeakMap = <K extends Object, V> (that: unknown): that is WeakMap<K, V> => that instanceof WeakMap;
export const _feIsArray = <T> (that: unknown): that is Array<T> => that instanceof Array;
export const _feIsSet = <T> (that: unknown): that is Set<T> => that instanceof Set;
export const _feIsObject = (that: unknown): that is Object => that instanceof Object;
export const _feIsFunction = (that: unknown): that is Function => that instanceof Function; // @TODO all to unknown
export const _feIsAsyncFunction = <
  P = unknown,
  Args extends any[] = any[]
> (that: unknown): that is (...args: Args)=>Promise<P> => that?.constructor?.name === 'AsyncFunction'; // @TODO return type ? probably done

export const _feIsIterable = <T>(that: unknown): that is Iterable<T> => (
  !!that
  && !!((that as Iterable<T>)[Symbol.iterator])
  && (that as Iterable<T>)[Symbol.iterator] instanceof Function  // @TODO review casting any or checking iterator otherwise
);

//* Also note that "actually calling next() and validating the returned result" should be the true test
//* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol
//* ... like the below:

export const _feIsIterableTest = <T>(that: unknown): that is Iterable<T> => {
  if (_feIsIterable(that)) {
    try {
      const iterator = (that as Iterable<T>)?.[Symbol.iterator]?.();
      if (iterator?.next?.() instanceof Object) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }
  return false;
};
