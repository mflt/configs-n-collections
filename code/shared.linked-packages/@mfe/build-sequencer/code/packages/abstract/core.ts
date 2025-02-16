import { mergician, MergicianOptions } from 'mergician'
import type { FeAnyI } from '../../../../fe3/src/index.ts'
import {
  _feIsNotanEmptyObject, _feIsEmptyObject, FeReadinessSignaling,
  _feAssertIsObject, _feAssertIsAsyncFunction, _feIsAsyncFunction,
  _feIsObject, $fe
} from '../../../../fe3/src/index.ts'
import {
  FeBlocksSequencerCtx, IFeBlocksSequencerCtx, FeCatchComm, FeBsqrCastCtxSlotstoInitiatorType,
} from '../../../../fessentials/blocks-sequencer.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BuiqBuilderExecCtx, BuiqExitCode, BuiqBlocksKeys, BuiqLocalBundlerConfig, BuiqSharedBundlerConfig,
  BuiqBundlerSpecificFePartFather, IBuiqBaseUtilities, BuiqEexecMods,
} from './types.d.ts'
import { _BlocksKeysDonor, BuiqExitCodeVariants } from './defaults-n-prototypes.ts'
import { loadBuilderConfigs } from './configs-loader.ts'

export { prompt, color }
export type IPrompt = typeof prompt
export type IPromptColor = typeof color

const catchComm = new FeCatchComm()

Error.stackTraceLimit = Number.POSITIVE_INFINITY  // @TODO why is this

const PROD = Bun.env.NODE_ENV === 'production'

const resolve = (path: string) => {
  const resolved = import.meta.resolve?.(path)
  if (!resolved) {
    throw new Error(`Not found: ${path}, maybe on wrong node version`)
  }
  return resolved.replace('file:/', '')
}

// loading buildCommonConfig and viteCommonConfigFn is delegated to the caller, as it can do it statically

export const builderEntryLoaded = new FeReadinessSignaling<string>();

(async function () {
  prompt.intro(`Build sequencer started for builder entry ${
      await builderEntryLoaded.tillReady
    }`)
})()

export class BuildSequencer <
  BundlerSpecificFePart extends BuiqBundlerSpecificFePartFather,
  BundlerLocalConfig extends BuiqLocalBundlerConfig<unknown,unknown>, // should not be undefined / unknown
  BundlerSharedConfig extends BuiqSharedBundlerConfig<unknown,unknown>,
  // * keep in sync w/ BuiqBuilderExecCtx
> extends FeBlocksSequencerCtx<
  BuiqBlocksKeys,
  BuiqBuilderExecCtx<
    BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig
    // the extension slots are not relevant in this abstract/bundler-independent context
  >,
  IBuiqBaseUtilities  // additional utils add to BuilderExtensionProps
>
{
  get builderName () { return this.sequencerName }
  get getBuilderCtx () { return this.getExecCtx }

  assigntoBuilderCtx (
    toMerge: Partial<BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>>,
    mergicianOptions?: MergicianOptions
  ) {
    return this.assigntoExecCtx(
      toMerge,
      mergicianOptions
    )
  }

  constructor(
    builderName: string,
    // stepsKeysDonor: ConstructorParameters<
    //   typeof FeStepsByrunnerCtx<
    //     FeBuilderStepsKeys,FeBuilderCtx<BundlerConfig,BuilderExtensionProps>,IFeBuilderRunnerUtilities
    //   >
    // >[1] | '_',  // @TODO named one?
    builderCtxRef: BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>,  // which is ExecCtx
    initiator?: Partial<
      & Pick<
        IFeBlocksSequencerCtx<
          BuiqBlocksKeys,
          BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>,
          IBuiqBaseUtilities
        >,
        'utilities'|'waitingforRequestedBlocktoCompleteTimeout'
      >
      & Omit<FeBsqrCastCtxSlotstoInitiatorType<
          BuiqBlocksKeys,BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>
        >,
        'execCtxRef'  // this one comes as a direct prop
      >
      & {
        getBuilderCtx: FeBlocksSequencerCtx<
          BuiqBlocksKeys,BuiqBuilderExecCtx<BundlerSpecificFePart,BundlerLocalConfig,BundlerSharedConfig>,IBuiqBaseUtilities
        >['getExecCtx']
      }
    >
  ) {
    builderEntryLoaded.makeObsolete()
    super(
      builderName,
      _BlocksKeysDonor, {
        ...initiator,
        execCtxRef: builderCtxRef
      }
    )
    if (!builderCtxRef || _feIsEmptyObject(builderCtxRef)) {
      throw new Error(
        `${!builderCtxRef ? 'Undefined' : 'Empty'} builder/exec context objects are not allowed`  // @TODO
      )
    }
    _feAssertIsObject(builderCtxRef,
      {message: `Builder/exec context should be a non-empty object`}
    )
    builderCtxRef.local ??= {} as BundlerLocalConfig
    builderCtxRef.shared ??= {} as BundlerSharedConfig
    builderCtxRef[$fe].meta = import.meta
    const r = this
    // r.getExecCtx ??= initiator?.getBuilderCtx || (() => builderCtx)
    r.utilities.catchComm ??= catchComm
    r.utilities.resolve ??= resolve
    r.utilities.prompt ??= prompt
    r.utilities.color ??= color
    builderCtxRef[$fe].utilities = r.utilities
    // ctx slots are ready at this point, internally and in the fe
    // @TODO if no bundlername, prompt
    r.utilities.prompt.log.info(`${r.builderName || '<missing name>'} builder started`)

    r.ctxSignals.sequencerReady.pass(r.utilities)  // warning: this is used as readiness signal for the higher order builder
  }

  async loadConfigs () {
    return loadBuilderConfigs<
      BundlerConfig,
      BuilderExtensionProps
    >(this)
  }

  async exec (): Promise<BuiqExitCode> {

    const r = this
    const {
      catchComm: _c,
      prompt: p,
      color: co
    } = r.utilities


  try {

    // this.execSignals.pre.tillDone // returns ctx


    _feAssertIsObject(proc)

    const builderConfig = await builderConfigPreps.pre({})
    // loadConfig({...props, catchComm: _catch})

    if (proc.ifTscistobeRan) {

      p.log.step(`tsc started`)
      // console.warn(builderConfig)

      _c.framingMessage = `Failed at tsc`
      // await $`tsc -b ${buildConfig.files.tscLocalConfigJsonPath}`

      p.log.step(`tsc ended`)
    }

    if (builderConfig.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
      p.log.step(`evaluating common config`)

      _c.framingMessage = `Failed at vite-common-config function`
      builderConfig.viteCommonConfig = props.viteCommonConfigFn // assumed to be a function if not null
        ?
          await props.viteCommonConfigFn({
            mode: 'build',
            config: builderConfig,
            resolve,
            _prompt
          })
        : {}
    }

    _c.framingMessage =
      `Failed importing the local vite config ts (${builderConfig.files.viteLocalConfigTsPath})`
    if (builderConfig.files.viteLocalConfigTsPath) {
      p.log.warn('Local vite config ts can not be determined. \n' +
        'If this is not how you intended it to be, please check the defaults and other related settings.')
    } else {
      const viteLocalConfigFn = await import(builderConfig.files.viteLocalConfigTsPath)
      _feAssertIsAsyncFunction<InlineConfig,[ViteLocalConfigFnProps]>(
        viteLocalConfigFn,
        {message: 'Local vite config is not a function'}
      )

      _c.framingMessage = `Failed at vite-local-config function`
      viteConfig = await viteLocalConfigFn({
        mode: 'build',
        config: builderConfig,
        resolve,
        _prompt
      })
    }

    // await viteBuild({
    //   ...viteConfig,
    //   configFile: false,
    // })

    p.outro('Building XOX ended nicely')
    return BuiqExitCodeVariants.done

    } catch (err) {
      p.log.error(`${
        (_c.framingMessage || '') +
        (err?.message ? '\n' + err?.message : '')
      }`)
      p.outro(color.bgRed(color.white(color.bold('Building XOX failed.'))))
      return BuiqExitCodeVariants.error
    }
  }
}
