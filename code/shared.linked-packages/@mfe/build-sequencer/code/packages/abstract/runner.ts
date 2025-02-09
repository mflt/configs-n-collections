import { mergician } from 'mergician'
import {
  _feIsObject, _feIsEmptyObject, _feIsAsyncFunction,
  _feAssertIsObject, _feAssertIsAsyncFunction,
  _feMakeRecordFeMapLike, $fe, FeExecSignaling, FeReadinessSignaling
} from '../../../../fe3/src/index.ts'
import {
  FeBuilderCtx, FeBuilderStepsKeys, FeBundlerConfigPrototype, IPrompt, IPromptColor,
} from './types'
import { _stepsKeysDonor } from './defaults-n-prototypes.ts'

export type FeCatchComm = {
  framingMessage: string|undefined
}



export class IFeBuilderRunnerCtx <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void
> {
  builderName: string
  bundlerName?: string
  steps: Record<
    FeBuilderStepsKeys,
    undefined| (()=> Promise<FeBuilderCtx<BundlerConfig,BuilderExtensionProps>>)
  >
  stepsCtrl: {
    skipTsc: boolean
  }
  execSignals: Record<
    FeBuilderStepsKeys,
    FeExecSignaling<BundlerConfig,BundlerConfig>
  >
  ctxSignals: {
    runnerReady: FeReadinessSignaling<IFeBuilderRunnerUtilities>
  }
  utilities: IFeBuilderRunnerUtilities
  getBuilderCtx: () => FeBuilderCtx<BundlerConfig,BuilderExtensionProps>
  defaultsProfileName?: string // narrow in children
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
    this.ctxSignals.runnerReady = new FeReadinessSignaling()
  }

  async step (
    stepId: FeBuilderStepsKeys
  ) {
    const _step = this.steps[stepId]
    const signaling = this.execSignals[stepId]
    if (signaling && _step) {
      if (!_feIsAsyncFunction(_step)) {
        throw // @TODO
      }
      signaling.skip()
      await _step(r.getBuilderCtx())
      signaling.done()  // @TODO if failed
    } else {
      signaling.request()
      await signaling.tillDone
    }
  }

}
