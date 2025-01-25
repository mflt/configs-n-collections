
export class FePromisewithResolvers <
  FulfillmentValueT = boolean,
  ErrorReasonT = unknown
> extends Promise<FulfillmentValueT>
{
  public get promise () { return this as Omit<typeof this, 'resolve'|'reject'>; }
  public resolve!: Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[0];
  public reject!: (reason?: ErrorReasonT) => void;  // Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[1]

  public constructor() {
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
// https://shaky.sh/promise-with-resolvers/
