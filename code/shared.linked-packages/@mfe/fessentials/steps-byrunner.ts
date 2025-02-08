import { mergician, type MergicianOptions } from 'mergician'
import {
  _feIsNotanEmptyObject, _feIsAsyncFunction, _feMakeRecordFeMapLike, $fe, FeExecSignaling, FeReadinessSignaling
} from '../fe3/src/index.ts'

export class FeCatchComm {
  framingMessage: string|undefined
}

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

export class IFeStepsByrunnerCtx <
  StepsKeys extends string,
  ExecCtx extends {}, // @TODO
  RunnerUtilities extends IFeByrunnerBaseUtilities = IFeByrunnerBaseUtilities
> {
  runnerName: string
  stepstoExecasFunctions: FeStepsByrunnerToExecasFunctions<StepsKeys,ExecCtx>
  stepstoSkip: FeStepsByrunnerToSkip<StepsKeys>
  stepstoExecasShadowFunctions?: StepsKeys[] // @TODO typing
  shadowStepFunctions?: FeStepsByrunnerToExecasFunctions<StepsKeys,ExecCtx>
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
    stepId: StepsKeys
  ) {
    const skip = this.stepstoSkip[stepId] === true  // @TODO test if not true but defined
    const _stepFn = this.stepstoExecasFunctions[stepId]
    const _shadowFn = this.shadowStepFunctions?.[stepId]
    const signaling = this.execSignals[stepId]  // @TODO test if usable or throw
    if (!skip) {
      if (_stepFn || this.stepstoExecasShadowFunctions?.includes(stepId)) {
        if (_stepFn) {
          if (!_feIsAsyncFunction(_stepFn)) {
            throw new Error(`${this.runnerName} got ${stepId} as to be executed as a function by got a non-function value`) // @TODO
          }
        } else {  // stepstoExecasShadowFunctions positive
          if (!_feIsAsyncFunction(_shadowFn)) {
            throw new Error(`${this.runnerName} got ${stepId} as to be executed as a shadow function by got a non-function value`) // @TODO
          }
        }
        signaling.skip({message: `${this.runnerName} is handling ${stepId} in the specified ${_stepFn? '' : 'shadow'} function call`})
        const ctxfromFn = await (_stepFn || _shadowFn!)(this.getProcessingCtx())
        signaling.done(ctxfromFn)  // @TODO if failed
        return ctxfromFn
      } else {
        signaling.request(this.getProcessingCtx())
        const ctxfromWaiting = await signaling.tillDone
        return ctxfromWaiting
      }
    } else {
       signaling.skip({message: `${this.runnerName} is skipping ${stepId} step`})
       signaling.skipped()
    }
  }
}
