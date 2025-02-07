import { mergician } from 'mergician'
import {
  _feIsObject, _feIsEmptyObject, _feIsAsyncFunction,
  _feAssertIsObject, _feAssertIsAsyncFunction,
  _feMakeRecordFeMapLike, $fe, FeExecSignaling, FeReadinessSignaling
} from '../fe3/src/index.ts'

export type FeCatchComm = {
  framingMessage: string|undefined
}

export type FeStepsByrunnerToExecasFunctions <
  StepsKeys extends string,
  ExecCtx extends {},
> = Record<
  StepsKeys,
  undefined| ((ctx: ExecCtx)=> Promise<ExecCtx>)
>

export type FeStepsByrunnerExecSignals <
  StepsKeys extends string,
  ExecCtx extends {},
> = Record<
  StepsKeys,
  FeExecSignaling<ExecCtx,ExecCtx>
>

export type FeStepsByrunnerToSkip <
  StepsKeys extends string
> = Record<
  StepsKeys,  // @TODO partial?
  undefined| true
>

export interface IFeByrunnerBaseUtilities {
  catchComm: FeCatchComm
}

export type FeStepsByrunnerBaseCtxSignals <
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> = {
  runnerReady: FeReadinessSignaling<RunnerUtilities>
}

export class IFeStepsByrunnerCtx <
  StepsKeys extends string,
  ExecCtx extends {}, // @TODO
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> {
  runnerName: string
  stepstoExecasFunctions: FeStepsByrunnerToExecasFunctions<StepsKeys,ExecCtx>
  stepstoSkip: FeStepsByrunnerToSkip<StepsKeys>
  execSignals: FeStepsByrunnerExecSignals<StepsKeys,ExecCtx>
  ctxSignals: FeStepsByrunnerBaseCtxSignals<RunnerUtilities>
  utilities: RunnerUtilities
  getProcessingCtx: () => ExecCtx
}
//  & RunnerExtensionProps

export class FeStepsByrunnerCtx <
  StepsKeys extends string,
  ExecCtx extends {},
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> extends IFeStepsByrunnerCtx<StepsKeys,ExecCtx,RunnerUtilities> {

  public constructor (
    public runnerName: string,
    stepsKeysDonor: Record<StepsKeys,{}>, // must bring all the step keys (functional or skipped) and no others
    initiator?: Partial<
      Omit<IFeStepsByrunnerCtx<StepsKeys,ExecCtx,RunnerUtilities>,'runnerName'>
    >
  ) {
    super()
    this.engageExecSignals(stepsKeysDonor)  // normally should not be overwritten
    this.ctxSignals.runnerReady ??= new FeReadinessSignaling()
    if (_feIsObject(initiator)) {
      Object.assign(this,mergician(this,initiator))
    }
    this.stepstoExecasFunctions ??= {} as typeof this.stepstoExecasFunctions
    this.stepstoSkip ??= {} as typeof this.stepstoSkip
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  engageExecSignals (
    stepsKeysDonor: Record<StepsKeys,{}>
  ) {
    this.execSignals = {...stepsKeysDonor} as unknown as typeof this.execSignals
    const signals = this.execSignals  // makes assertion work in depth
    _feMakeRecordFeMapLike(signals)
    signals[$fe]?.forEach?.((_,key) => key !== undefined &&
      signals![$fe]?.set?.(key,
        new FeExecSignaling()
      )
    )
  }

  async step (
    stepId: StepsKeys
  ) {
    const skip = this.stepstoSkip[stepId] === true  // @TODO test if not true but defined
    const _stepFn = this.stepstoExecasFunctions[stepId]
    const signaling = this.execSignals[stepId]  // @TODO test if usable or throw
    if (!skip && signaling && _stepFn) {
      if (!_feIsAsyncFunction(_stepFn)) {
        throw new Error(`${this.runnerName} got ${stepId} as to be executed as a function by got a non-function value`) // @TODO
      }
      signaling.skip({message: `${this.runnerName} is handling ${stepId} in the specified function call`})
      const ctxfromFn = await _stepFn(this.getProcessingCtx())
      signaling.done(ctxfromFn)  // @TODO if failed
      return ctxfromFn
    } else {
      signaling.request(this.getProcessingCtx())
      const ctxfromWaiting = await signaling.tillDone
      return ctxfromWaiting
    }
  }

}
