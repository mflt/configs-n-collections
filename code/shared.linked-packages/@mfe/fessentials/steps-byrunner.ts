import { mergician, type MergicianOptions } from 'mergician'
import type {
  _Branded, _WithAssertedBrand, _FeMilliseconds,
} from '../fe3/src/index.ts'
import {
  FeExecSignaling, FeReadinessSignaling,
  _feIsNotanEmptyObject, _feIsAsyncFunction, _feMakeRecordFeMapLike, $fe, _feDelay
} from '../fe3/src/index.ts'

export class FeCatchComm {
  framingMessage: string|undefined
}

const __waitingforRequestedSteptoCompleteDefaultTimeout = 5000

export type FeStepsByrunnerToExecasFunctions <
  StepsKeys extends string,
  ExecCtx extends {}, // @TODO prototype, aka processing ctx
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

export type FeStepsByrunnerWaitingforRequestedSteptoCompleteTimeouts <
  StepsKeys extends string
> = Record<
  StepsKeys,  // @TODO partial?
  number | _FeMilliseconds  // @TODO test
>

export class IFeStepsByrunnerCtx <
  StepsKeys extends string,
  ExecCtx extends {}, // @TODO
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> {
  runnerName: string
  stepstoExecasFunctions: FeStepsByrunnerToExecasFunctions<StepsKeys,ExecCtx>
  stepstoSkip: FeStepsByrunnerToSkip<StepsKeys>
  builtinStepstoSkip?: StepsKeys[] // @TODO typing
  builtinStepsFunctions?: FeStepsByrunnerToExecasFunctions<StepsKeys,ExecCtx>
  execSignals: FeStepsByrunnerExecSignals<StepsKeys,ExecCtx>
  ctxSignals: FeStepsByrunnerBaseCtxSignals<RunnerUtilities>
  utilities: RunnerUtilities
  getProcessingCtx: () => ExecCtx
  waitingforRequestedSteptoCompleteTimeout:
    FeStepsByrunnerWaitingforRequestedSteptoCompleteTimeouts<StepsKeys>
}
// & RunnerExtensionProps

export class FeStepsByrunnerCtx <
  StepsKeys extends string,
  ExecCtx extends {},
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> extends IFeStepsByrunnerCtx<StepsKeys,ExecCtx,RunnerUtilities> {

  public constructor (
    public runnerName: string,
    private stepsKeysDonor: Record<StepsKeys,{}>, // must bring all the step keys (functional or skipped) and no others
    initiator?: Partial<
      Omit<IFeStepsByrunnerCtx<StepsKeys,ExecCtx,RunnerUtilities>,'runnerName'>
    >
  ) {
    super()
    this.engageExecSignals()  // normally should not be overwritten
    this.ctxSignals.runnerReady ??= new FeReadinessSignaling()
    if (_feIsNotanEmptyObject(initiator)) {
      Object.assign(this, mergician(this, initiator))
    }
    this.stepstoExecasFunctions ??= {} as typeof this.stepstoExecasFunctions
    // _feMakeRecordFeMapLike(this.stepstoExecasFunctions)
    this.stepstoSkip ??= {} as typeof this.stepstoSkip
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoProcessingCtx (
    toMerge: Partial<ExecCtx>,
    mergicianOptions?: MergicianOptions
  ): ExecCtx {
    const processingCtx = this.getProcessingCtx()
    if (_feIsNotanEmptyObject(toMerge)) {
      return Object.assign(processingCtx, mergician(
        mergicianOptions||{}
      )(
        processingCtx,
        toMerge
      )) as ExecCtx // returns the target aka this.getProcessingCtx()
    }
    return processingCtx
  }

  engageExecSignals () {
    const signals = this.execSignals = {...this.stepsKeysDonor} as unknown as typeof this.execSignals
    // makes assertion work in depth @TODO does it?
    _feMakeRecordFeMapLike(signals)
    signals[$fe]?.forEach?.((_, key) => key !== undefined &&
      signals[$fe]?.set?.(key,
        new FeExecSignaling()
      )
    )
  }

  async step (
    stepId: StepsKeys,
    waitingforRequestedSteptoCompleteHandler?: () => Promise<void>
  ) {
    // * Exceptions are let go
    const skip = this.stepstoSkip[stepId] === true  // @TODO test if not true but defined
    const _stepFn = this.stepstoExecasFunctions[stepId]
    const _builtinFn = this.builtinStepsFunctions?.[stepId]
    const signaling = this.execSignals[stepId]  // @TODO test if usable or throw
    if (!skip) {
      if (_stepFn || !this.builtinStepstoSkip?.includes(stepId)) {
        if (_stepFn) {
          if (!_feIsAsyncFunction(_stepFn)) {
            throw new Error(`${this.runnerName} got ${stepId} as to be executed as a function but got a non-function value`) // @TODO
          }
        } else {  // stepstoExecasBuiltinFunctions positive
          if (!_feIsAsyncFunction(_builtinFn)) {
            throw new Error(`${this.runnerName} got ${stepId} as to be executed as a built-in function but got a non-function value`) // @TODO
          }
        }
        signaling.skip({
          message: `${this.runnerName} is handling ${stepId} in the specified ${_stepFn? '' : 'built-in'} function call`,
          execSignaling: 'RequestSkipped'
        })
        const ctxfromFn = await (_stepFn || _builtinFn!)(this.getProcessingCtx())
        signaling.done(ctxfromFn)  // @TODO if failed
        return ctxfromFn
      } else {
        const _timeoutHandler = _feIsAsyncFunction(waitingforRequestedSteptoCompleteHandler)
          ?
          waitingforRequestedSteptoCompleteHandler
          :
          _feDelay(
            this.waitingforRequestedSteptoCompleteTimeout[stepId] || __waitingforRequestedSteptoCompleteDefaultTimeout,
            () => {
              throw new Error(`${this.runnerName} got ${stepId} as to be executed as a built-in function but got a non-function value`) // @TODO
            } // @TODO will it throw here?
          )
        signaling.request(this.getProcessingCtx())
        const ctxfromWaiting = await Promise.all([
          signaling.tillDone,
          _timeoutHandler
        ]) as Awaited<ExecCtx>
        return ctxfromWaiting
      }
    } else {
       signaling.skip({
         message: `${this.runnerName} is skipping ${stepId} step`,
         execSignaling: 'RequestSkipped'
       })
       signaling.skipped()
       return this.getProcessingCtx()
    }
  }
}
