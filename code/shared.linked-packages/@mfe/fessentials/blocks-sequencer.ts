import { mergician, type MergicianOptions } from 'mergician'
import type {
  _Branded, _WithAssertedBrand, _FeMilliseconds,
} from '../fe3/src/index.ts'
import {
  FeExecSignaling, FeReadinessSignaling, _feAssertIsSyncFunction, _feIsFunction, _feIsObject, _feIsArray,
  _feIsNotanEmptyObject, _feIsAsyncFunction, _feMakeRecordFeMapLike, $fe, _feDelay
} from '../fe3/src/index.ts'

export class FeCatchComm {
  framingMessage: string|undefined
}

export type FeBsqrBlocksKeysT = string

const __waitingforRequestedBlocktoCompleteDefaultTimeout = 5000

export type FeBsqrToExecasFunctions <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {}, // @TODO prototype, aka processing ctx
> = Record<
  BlocksKeys,
  undefined| ((ctx: ExecCtx)=> Promise<ExecCtx>)
>

export type FeBsqrExecSignals <
  BlocksKeys extends FeBsqrBlocksKeysT,
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
  BlocksKeys extends FeBsqrBlocksKeysT
> = Record<
  BlocksKeys,  // @TODO partial?
  number | _FeMilliseconds  // @TODO test
>

export type FeBsqrAddtoSkipped =
  | Array<FeBsqrBlocksKeysT>
  | {
    blocks: Array<FeBsqrBlocksKeysT>,
    builtinBlocks: Array<FeBsqrBlocksKeysT>
  }

export class IFeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
  // * @TODO but basically it's a matter of the implementation, which will pass it arround between blocks
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> {
  sequencerName: string
  blockstoExecasFunctions: Partial<FeBsqrToExecasFunctions<BlocksKeys,ExecCtx>>
  blockstoSkip: Set<BlocksKeys> // @TODO typing
  builtinBlockstoSkip?: Set<BlocksKeys> // @TODO typing
  protected builtinBlocksFunctions?: Partial<FeBsqrToExecasFunctions<BlocksKeys,ExecCtx>>
  execSignals: FeBsqrExecSignals<BlocksKeys,ExecCtx>
  ctxSignals: FeBsqrBaseCtxSignals<Utilities>
  utilities: Utilities
  getExecCtx: () => ExecCtx // all blocks are expected to process this shared context
  waitingforRequestedBlocktoCompleteTimeout:
    FeBsqrWaitingforRequestedBlocktoCompleteTimeouts<BlocksKeys>
}
// & SequencerExtensionProps

export type FeBsqrInitiorModder <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
> = {
  // redefine types
  blockstoSkip?: Array<BlocksKeys> // @TODO typing
  builtinBlockstoSkip?: Array<BlocksKeys> // @TODO typing
  // helper initiator slots
  execCtxRef?: ExecCtx
  addtoSkipped?: FeBsqrAddtoSkipped
}

export class FeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> extends IFeBlocksSequencerCtx<BlocksKeys,ExecCtx,Utilities> {

  public constructor (
    public sequencerName: string,
    protected blocksKeysDonor: Record<BlocksKeys,{}>, // must bring all the blocks keys (functional or skipped) and no others
    initiator?: Partial<
      Omit<IFeBlocksSequencerCtx<BlocksKeys,ExecCtx,Utilities>,'sequencerName'|'blockstoSkip'|'builtinBlockstoSkip'>
      // * see FeBsqrInitiorMod
      & Partial<Pick<IFeBlocksSequencerCtx<BlocksKeys,ExecCtx,Utilities>,'blockstoExecasFunctions'>>
      & FeBsqrInitiorModder<BlocksKeys,ExecCtx>
    >
  ) {
    super()
    this.engageExecSignals()  // normally should not be overwritten
    this.ctxSignals.sequencerReady ??= new FeReadinessSignaling()
    if (_feIsNotanEmptyObject(initiator)) {
      const { blockstoSkip, builtinBlockstoSkip, execCtxRef, addtoSkipped,...trimmedInitiator } = initiator
      Object.assign(this, mergician(this, trimmedInitiator))
    }
    this.blockstoExecasFunctions ??= {} as typeof this.blockstoExecasFunctions
    // _feMakeRecordFeMapLike(this.blockstoExecasFunctions)
    this.blockstoSkip = new Set<BlocksKeys>([
      ...(initiator?.blockstoSkip || []),
      ...(_feIsArray(initiator?.addtoSkipped)
        ? initiator.addtoSkipped
        : initiator?.addtoSkipped?.blocks || []
      )
    ] as Array<BlocksKeys>)
    this.builtinBlockstoSkip = new Set<BlocksKeys>([
      ...(initiator?.builtinBlockstoSkip || []),
      ...(_feIsObject(initiator?.addtoSkipped)
        ? (initiator.addtoSkipped as Exclude<FeBsqrAddtoSkipped,Array<unknown>>).builtinBlocks || []
        : []
      )
    ] as Array<BlocksKeys>)
    if (!_feIsFunction(this.getExecCtx)) {
      if (_feIsObject(initiator?.execCtxRef)) {
        this.getExecCtx = ()=> initiator?.execCtxRef!
      } else {
        throw new Error(
          `Neither getExecCtx or execCtxRef for ${this.sequencerName || '<unnamed seqiencer>'} were specified`
        )
      }
    } else {
      _feAssertIsSyncFunction<ExecCtx>(
        this.getExecCtx,
        {message: `getExecCtx in ${this.sequencerName || '<unnamed seqiencer>'} is not a function`}
      )
    }
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoExecCtx (
    toMerge: Partial<ExecCtx>,
    mergicianOptions?: MergicianOptions
  ): ExecCtx {
    const execCtxRef = this.getExecCtx()
    if (_feIsNotanEmptyObject(toMerge)) {
      return Object.assign(execCtxRef, mergician(
        mergicianOptions||{}
      )(
        execCtxRef,
        toMerge
      )) as ExecCtx // returns the target aka this.getExecCtx()
    }
    return execCtxRef
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
    const skip = this.blockstoSkip?.has(blockId)
    const _blockFn = this.blockstoExecasFunctions[blockId]
    const _builtinFn = this.builtinBlocksFunctions?.[blockId]
    const signaling = this.execSignals[blockId]  // @TODO test if usable or throw
    if (!skip) {
      if (_blockFn || !this.builtinBlockstoSkip?.has(blockId)) {
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
