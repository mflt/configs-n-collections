
type _Resolve <
  FulfillmentValueT = true,
> =
  Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[0]

type _Reject <
  ErrorReasonT = unknown
> =
  (reason?: ErrorReasonT) => void  // Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[1]

export class FePromisewithResolvers <
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends Promise<FulfillmentValueT> {

  static get [Symbol.species]() { // @TODO
    return Promise;
  }
  public get promise () { return this as Omit<typeof this, 'resolve'|'reject'> }
  public resolve!: _Resolve<FulfillmentValueT>
  public reject!: _Reject<ErrorReasonT>

  public constructor () {
    let resolve_reject: [_Resolve<FulfillmentValueT>, _Reject<ErrorReasonT>]
    super((resolve, reject) => {
      resolve_reject = [resolve, reject]
    })
    this.resolve = resolve_reject![0]
    this.reject = resolve_reject![1]
  }
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
// https://shaky.sh/promise-with-resolvers/

export class FeExecSignaling <
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends FePromisewithResolvers<FulfillmentValueT,ErrorReasonT> {
  public get requested () { return this.promise as Promise<true> }
  public done (value?: FulfillmentValueT) { this.resolve(value || true as FulfillmentValueT) }
  public fail (err: ErrorReasonT) { this.reject(err)}
  public constructor () {
    super()
  }
}



export class DeferredPromise extends Promise<void> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor () {
    let internalResolve = () => { };
    let internalReject = () => { };
    super((resolve, reject) => {
        internalResolve = resolve;
        internalReject = reject;
    });
    this.resolve = internalResolve;
    this.reject = internalReject;
  }
}

// https://gist.github.com/domenic/8ed6048b187ee8f2ec75

