import { mergician, MergicianOptions } from 'mergician'
import { _fe, $fe, FeReadinessSignaling } from '@mflt/_fe'
import {
  FeJobBlocksSequencerAsyncCtx, IFeJobBlocksSequencerAsyncCtx, 
  FeCat4, FeJbsqCastCtxSlotstoInitiatorType,
} from '@mflt/feware'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BuiqBuilderJobTerms, BuiqExitCode, BuiqBlocksKeys, BuiqBundlerNativeConfigAndOptions, BuiqSharedSetupBundlerNativePart,
  BuiqMinimalBundlerSpecificOwnJobTerms, IBuiqBaseUtilities, BuiqExecMods,
} from './types.ts'
import { _BlocksKeysDonor, BuiqExitCodeVariants } from './defaults-n-prototypes.ts'
import { loadBuilderConfigs } from './configs-loader.ts'

export { prompt, color }
export type IPrompt = typeof prompt
export type IPromptColor = typeof color

const c4 = new FeCat4()

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
  BundlerSpecificFePart extends BuiqMinimalBundlerSpecificOwnJobTerms,
  BundlerLocalSetup extends BuiqBundlerNativeConfigAndOptions<unknown,unknown>, // should not be undefined / unknown
  BundlerSharedSetup extends BuiqSharedSetupBundlerNativePart<unknown,unknown>,
  // * keep in sync w/ BuiqBuilderJobTerms
> extends FeJobBlocksSequencerAsyncCtx<
    BuiqBlocksKeys,
    BuiqBuilderJobTerms<
      BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup
      // the extension slots are not relevant in this abstract/bundler-independent context
    >,
    IBuiqBaseUtilities  // additional utils add to BuilderExtensionProps
>
{
  get builderName () { return this.sequencerName }
  get getBuilderJobTerms () {
    return this.getJobTerms as unknown as ReturnType<typeof this.getJobTerms>
    // @TODO this annoying explicit typing was needed due to $fe in the return type
  }

  assigntoBuilderJobTerms (
    toMerge: Partial<BuiqBuilderJobTerms<BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup>>,
    mergicianOptions?: MergicianOptions
  ) {
    return this.assigntoJobTerms(
      toMerge,
      mergicianOptions
    ) as unknown as ReturnType<typeof this.assigntoJobTerms>
    // @TODO this annoying explicit typing was needed due to $fe in the return type
  }

  constructor(
    builderName: string,
    // stepsKeysDonor: ConstructorParameters<
    //   typeof FeStepsByrunnerCtx<
    //     FeBuilderStepsKeys,FeBuilderCtx<BundlerConfig,BuilderExtensionProps>,IFeBuilderRunnerUtilities
    //   >
    // >[1] | '_',  // @TODO named one?
    builderJobTerms: BuiqBuilderJobTerms<BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup>,
    initiator?: Partial<
      & Pick<
        IFeJobBlocksSequencerAsyncCtx<
          BuiqBlocksKeys,
          BuiqBuilderJobTerms<BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup>,
          IBuiqBaseUtilities
        >,
        'utilities'|'waitingforRequestedBlocktoCompleteTimeout'
      >
      & Omit<FeJbsqCastCtxSlotstoInitiatorType<
          BuiqBlocksKeys,BuiqBuilderJobTerms<BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup>
        >,
        'jobTermsRef'  // this one comes as a direct prop
      >
      & {
        getBuilderJobTerms: FeJobBlocksSequencerAsyncCtx<
          BuiqBlocksKeys,BuiqBuilderJobTerms<BundlerSpecificFePart,BundlerLocalSetup,BundlerSharedSetup>,IBuiqBaseUtilities
        >['getJobTerms']
      }
    >
  ) {
    builderEntryLoaded.makeObsolete()
    super(
      builderName,
      _BlocksKeysDonor, {
        ...initiator,
        jobTermsRef: builderJobTerms
      }
    )
    if (!builderJobTerms || _fe.isEmptyObject(builderJobTerms)) {
      throw new Error(
        `${!builderJobTerms ? 'Undefined' : 'Empty'} builder/exec context objects are not allowed`  // @TODO
      )
    }
    _fe.assertIsObject(builderJobTerms,
      {message: `Builder/exec context (job terms) should be a non-empty object`}
    )
    builderJobTerms.local ??= {} as BundlerLocalSetup
    builderJobTerms.shared ??= {} as BundlerSharedSetup
    builderJobTerms[$fe].meta = import.meta
    const sq = this
    // exe.getJobTerms ??= initiator?.getBuilderJobTerms || (() => builderJobTermsRef)
    sq.utilities.c4 ??= c4
    sq.utilities.resolve ??= resolve
    sq.utilities.prompt ??= prompt
    sq.utilities.log ??= prompt?.log
    sq.utilities.color ??= color
    builderJobTerms[$fe].utilities = sq.utilities
    // ctx slots are ready at this point, internally and in the fe
    // @TODO if no bundlername, prompt
    sq.utilities.prompt.log.info(`${sq.builderName || '<missing name>'} builder started`)
    sq.ctxSignals.sequencerReady.pass(sq.utilities)  // warning: this is used as readiness signal for the higher order builder
  }

  async loadConfigs () {
    return loadBuilderConfigs<
      BundlerSpecificFePart,
      BundlerLocalSetup,
      BundlerSharedSetup
    >(this)
  }

  async exec (): Promise<BuiqExitCode> {

    const sq = this
    const squ = sq.utilities


  try {

    // this.execSignals.pre.tillDone // returns ctx


    _fe.assertIsObject(proc)

    const builderConfig = await builderConfigPreps.pre({})
    // loadConfig({...props, c4: _catch})

    if (proc.ifTscistobeRan) {

      squ.log.step(`tsc started`)
      // console.warn(builderConfig)

      squ.c4.throwwith = `Failed at tsc`
      // await $`tsc -b ${buildConfig.files.tscLocalConfigJsonPath}`

      squ.log.step(`tsc ended`)
    }

    if (builderConfig.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
      squ.log.step(`evaluating common config`)

      squ.c4.throwwith = `Failed at vite-common-config function`
      builderConfig.viteCommonConfig = props.viteCommonConfigFn // assumed to be a function if not null
        ?
          await props.viteCommonConfigFn({
            mode: 'build',
            config: builderConfig,
            resolve,
            prompt: squ.prompt
          })
        : {}
    }

    squ.c4.throwwith =
      `Failed importing the local vite config ts (${builderConfig.files.viteLocalConfigTsPath})`
    if (builderConfig.files.viteLocalConfigTsPath) {
      squ.log.warn('Local vite config ts can not be determined. \n' +
        'If this is not how you intended it to be, please check the defaults and other related settings.')
    } else {
      const viteLocalConfigFn = await import(builderConfig.files.viteLocalConfigTsPath)
      _fe.assertIsAsyncFunction<InlineConfig,[ViteLocalConfigFnProps]>(
        viteLocalConfigFn,
        {message: 'Local vite config is not a function'}
      )

      squ.c4.throwwith = `Failed at vite-local-config function`
      viteConfig = await viteLocalConfigFn({
        mode: 'build',
        config: builderConfig,
        resolve,
        prompt: squ.prompt
      })
    }

    // await viteBuild({
    //   ...viteConfig,
    //   configFile: false,
    // })

    squ.prompt.outro('Building XOX ended nicely')
    return BuiqExitCodeVariants.done

    } catch (err) {
      squ.log.error(`${
        (squ.c4.throwwith || '') +
        (err?.message ? '\n' + err?.message : '')
      }`)
      squ.prompt.outro(color.bgRed(color.white(color.bold('Building XOX failed.'))))
      return BuiqExitCodeVariants.error
    }
  }
}
