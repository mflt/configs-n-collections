import { mergician } from 'mergician'
import { _feIsObject, _feIsEmptyObject, _feIsAsyncFunction,
  _feAssertIsObject, _feAssertIsAsyncFunction, 
  FePromisewithResolvers, FeExecSignaling, _feMakeRecordFeMapLike,
  $fe, FeMapLikeCollectionObject, FeReadinessSignaling,
} from '../../../../fe3/src/index.ts'
import {
  FeBuilderCtx, FeCatchComm, 
  FeBundlerConfigPrototype, IPrompt, IPromptColor,
} from './types.d'

export type FeCatchComm = {
  framingMessage: string|undefined
}

const __stepsKeysDonor = { // Just to have iterable keys to engage
  config_pkglocal: {},
  config_shared: {},
  config_effective: {},
  pre: {},
  tsc: {},
  main: {},
  additional: {},
  post: {},
} as const
const _stepsKeysDonor = __stepsKeysDonor as unknown as Record<
  keyof typeof __stepsKeysDonor,
  FeExecSignaling<any>
>

export class IFeBuilderRunnerCtx <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> {
  builderName: string
  bundlerName?: string
  steps: Record<
      keyof typeof _stepsKeysDonor,
      undefined| (()=> Promise<FeBuilderCtx<BundlerConfig,BuilderExtensionProps>>)
    >
  getBuilderCtx: () => FeBuilderCtx<BundlerConfig,BuilderExtensionProps>
  prompt: IPrompt
  color: IPromptColor
  defaultsProfileName?: string // narrow in children
  catchComm: FeCatchComm
  execSignals: Record<
      keyof typeof _stepsKeysDonor,
      FeExecSignaling<BundlerConfig,BundlerConfig>
    >
  resolve: (path: string) => any  // @TODO any?
  ctxSignals: {
    catchCommReady: FeReadinessSignaling<FeCatchComm>
  }
}
//  & RunnerExtensionProps

export class FeBuilderRunnerCtx <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> extends IFeBuilderRunnerCtx<BundlerConfig,BuilderExtensionProps> {

  public constructor (
    initiator?: Partial<FeBuilderRunnerCtx>
  ) {
    super()
    this.engageSignals()
    if (_feIsObject(initiator)) {
      Object.assign(this,mergician(this,initiator))
    }
    this.builderName
  }

  engageSignals () {
    this.execSignals = {..._stepsKeysDonor} as unknown as typeof this.execSignals
    const signals = this.execSignals  // make assertion work in depth
    _feMakeRecordFeMapLike(signals)
    signals[$fe]?.forEach?.((_,key) => key !== undefined &&
      signals![$fe]?.set?.(key,
        new FeExecSignaling()
      )
    )
    this.ctxSignals.catchCommReady = new FeReadinessSignaling()
  }

  async step (
    stepId: keyof typeof __stepsKeysDonor
  ) {
    const step = this.steps[stepId]
    const signaling = this.execSignals[stepId]
    if (signaling && step) {
      if (!_feIsAsyncFunction(step)) {
        throw // @TODO
      }
      signaling.skip()
      await step(r.getBuilderCtx())
      signaling.done()  // @TODO if failed
    } else {
      signaling.request()
      await signaling.tillDone
    }
  }

}
