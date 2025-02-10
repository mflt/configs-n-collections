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

const __waitingforRequestedBlocktoCompleteDefaultTimeout = 5000

export type FeBsqrToExecasFunctions <
  BlocksKeys extends string,
  ExecCtx extends {}, // @TODO prototype, aka processing ctx
> = Record<
  BlocksKeys,
  undefined| ((ctx: ExecCtx)=> Promise<ExecCtx>)
>

export type FeBsqrExecSignals <
  BlocksKeys extends string,
  ExecCtx extends {},
> = Record<
  BlocksKeys,
  FeExecSignaling<ExecCtx,ExecCtx>
>

export interface IFeBsqrBaseUtilities {
  catchComm: FeCatchComm
}

export type FeBsqrBaseCtxSignals <
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> = {
  sequencerReady: FeReadinessSignaling<Utilities>
}

export type FeBsqrWaitingforRequestedBlocktoCompleteTimeouts <
  BlocksKeys extends string
> = Record<
  BlocksKeys,  // @TODO partial?
  number | _FeMilliseconds  // @TODO test
>

export class IFeBlocksSequencerCtx <
  BlocksKeys extends string,
  ExecCtx extends {}, // @TODO
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> {
  sequencerName: string
  blockstoExecasFunctions: FeBsqrToExecasFunctions<BlocksKeys,ExecCtx>
  blockstoSkip: BlocksKeys[] // @TODO typing
  builtinBlockstoSkip?: BlocksKeys[] // @TODO typing
  builtinBlocksFunctions?: FeBsqrToExecasFunctions<BlocksKeys,ExecCtx>
  execSignals: FeBsqrExecSignals<BlocksKeys,ExecCtx>
  ctxSignals: FeBsqrBaseCtxSignals<Utilities>
  utilities: Utilities
  getExecCtx: () => ExecCtx
  waitingforRequestedBlocktoCompleteTimeout:
    FeBsqrWaitingforRequestedBlocktoCompleteTimeouts<BlocksKeys>
}
// & SequencerExtensionProps

export class FeBlocksSequencerCtx <
  BlocksKeys extends string,
  ExecCtx extends {},
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> extends IFeBlocksSequencerCtx<BlocksKeys,ExecCtx,Utilities> {

  public constructor (
    public sequencerName: string,
    private blocksKeysDonor: Record<BlocksKeys,{}>, // must bring all the blocks keys (functional or skipped) and no others
    initiator?: Partial<
      Omit<IFeBlocksSequencerCtx<BlocksKeys,ExecCtx,Utilities>,'sequencerName'>
    >
  ) {
    super()
    this.engageExecSignals()  // normally should not be overwritten
    this.ctxSignals.sequencerReady ??= new FeReadinessSignaling()
    if (_feIsNotanEmptyObject(initiator)) {
      Object.assign(this, mergician(this, initiator))
    }
    this.blockstoExecasFunctions ??= {} as typeof this.blockstoExecasFunctions
    // _feMakeRecordFeMapLike(this.blockstoExecasFunctions)
    this.blockstoSkip ??= {} as typeof this.blockstoSkip
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoProcessingCtx (
    toMerge: Partial<ExecCtx>,
    mergicianOptions?: MergicianOptions
  ): ExecCtx {
    const processingCtx = this.getExecCtx()
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
    const signals = this.execSignals = {...this.blocksKeysDonor} as unknown as typeof this.execSignals
    // makes assertion work in depth @TODO does it?
    _feMakeRecordFeMapLike(signals)
    signals[$fe]?.forEach?.((_, key) => key !== undefined &&
      signals[$fe]?.set?.(key,
        new FeExecSignaling()
      )
    )
  }

  async executeBlock (
    blockId: BlocksKeys,
    waitingforRequestedBlocktoCompleteHandler?: () => Promise<void>
  ) {
    // * Exceptions are let go
    const skip = this.blockstoSkip?.includes(blockId)
    const _blockFn = this.blockstoExecasFunctions[blockId]
    const _builtinFn = this.builtinBlocksFunctions?.[blockId]
    const signaling = this.execSignals[blockId]  // @TODO test if usable or throw
    if (!skip) {
      if (_blockFn || !this.builtinBlockstoSkip?.includes(blockId)) {
        if (_blockFn) {
          if (!_feIsAsyncFunction(_blockFn)) {
            throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a function but got a non-function value`) // @TODO
          }
        } else {  // blockstoExecasBuiltinFunctions positive
          if (!_feIsAsyncFunction(_builtinFn)) {
            throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a built-in function but got a non-function value`) // @TODO
          }
        }
        signaling.skip({
          message: `${this.sequencerName} is handling ${blockId} in the specified ${_blockFn? '' : 'built-in'} function call`,
          execSignaling: 'RequestSkipped'
        })
        const ctxfromFn = await (_blockFn || _builtinFn!)(this.getExecCtx())
        signaling.done(ctxfromFn)  // @TODO if failed
        return ctxfromFn
      } else {
        const _timeoutHandler = _feIsAsyncFunction(waitingforRequestedBlocktoCompleteHandler)
          ?
          waitingforRequestedBlocktoCompleteHandler
          :
          _feDelay(
            this.waitingforRequestedBlocktoCompleteTimeout[blockId] || __waitingforRequestedBlocktoCompleteDefaultTimeout,
            () => {
              throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a built-in function but got a non-function value`) // @TODO
            } // @TODO will it throw here?
          )
        signaling.request(this.getExecCtx())
        const ctxfromWaiting = await Promise.all([
          signaling.tillDone,
          _timeoutHandler
        ]) as Awaited<ExecCtx>
        return ctxfromWaiting
      }
    } else {
       signaling.skip({
         message: `${this.sequencerName} is skipping ${blockId} block`,
         execSignaling: 'RequestSkipped'
       })
       signaling.skipped()
       return this.getExecCtx()
    }
  }
}
