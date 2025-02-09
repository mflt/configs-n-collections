import { MergicianOptions } from 'mergician'
import {
  _feIsNotanEmptyObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction, _feIsAsyncFunction
} from '../../../../fe3/src/index.ts'
import { FeStepsByrunnerCtx, IFeStepsByrunnerCtx, FeCatchComm } from '../../../../fessentials/steps-byrunner.ts'
import * as prompt from '@clack/prompts'
import color from 'picocolors'
import type {
  BsqrBuilderCtx, FeBuilderReturnCode,
  FeBundlerConfigPrototype, FeBuilderStepsKeys, IBsqrRunnerUtilities,
} from './types.d.ts'
import { _stepsKeysDonor } from './defaults-n-prototypes.ts'
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

export class FeBuildSequencer <
  BundlerConfig extends FeBundlerConfigPrototype = FeBundlerConfigPrototype,
  BuilderExtensionProps extends Record<string,any>|void = void,
> extends FeStepsByrunnerCtx<
  FeBuilderStepsKeys,
  BsqrBuilderCtx<BundlerConfig,BuilderExtensionProps>,
  IBsqrRunnerUtilities
>
{
  get builderName () { return this.runnerName }
  get getBuilderCtx () { return this.getProcessingCtx }

  assigntoBuilderCtx (
    toMerge: BsqrBuilderCtx<BundlerConfig,BuilderExtensionProps>,
    mergicianOptions?: MergicianOptions
  ) {
    return this.assigntoProcessingCtx(toMerge, mergicianOptions)
  }

  constructor(
    builderName: string,
    // stepsKeysDonor: ConstructorParameters<
    //   typeof FeStepsByrunnerCtx<
    //     FeBuilderStepsKeys,FeBuilderCtx<BundlerConfig,BuilderExtensionProps>,IFeBuilderRunnerUtilities
    //   >
    // >[1] | '_',  // @TODO named one?
    builderCtx: BsqrBuilderCtx<BundlerConfig,BuilderExtensionProps>,
    initiator?: Partial<
      Omit<IFeStepsByrunnerCtx<
        FeBuilderStepsKeys,BsqrBuilderCtx<BundlerConfig,BuilderExtensionProps>,IBsqrRunnerUtilities
      >,'runnerName'|'getProcessingCtx'> & {
        getBuilderCtx: FeStepsByrunnerCtx<
          FeBuilderStepsKeys,BsqrBuilderCtx<BundlerConfig,BuilderExtensionProps>,IBsqrRunnerUtilities
        >['getProcessingCtx']
      }
    >
  ) {
    super(
      builderName,
      // (stepsKeysDonor !== '_' && stepsKeysDonor) ||
      _stepsKeysDonor,
      initiator
    )
    // @TODO test builderCtx, if not defined throw
    const r = this
    r.getProcessingCtx ??= initiator?.getBuilderCtx || (() => builderCtx)
    r.utilities.catchComm ??= catchComm
    r.utilities.resolve ??= resolve
    r.utilities.prompt ??= prompt
    r.utilities.color ??= color
    r.utilities.prompt.intro(`${r.builderName || '<missing name>'} builder started`)
    // @TODO if no bundlername, prompt

    r.ctxSignals.runnerReady.pass(r.utilities)  // warning: this is used as readiness signal for the higher order builder
  }

  async loadConfigs () {
    return loadBuilderConfigs<
      BundlerConfig,
      BuilderExtensionProps
    >(this)
  }

  async exec (): Promise<FeBuilderReturnCode> {

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

    p.outro('Lib building ended nicely')
    return FeBunViteBuilderReturnVariants.done

    } catch (err) {
      p.log.error(`${
        (_c.framingMessage || '') +
        (err?.message ? '\n' + err?.message : '')
      }`)
      p.outro(color.bgRed(color.white(color.bold('Lib building failed.'))))
      return FeBunViteBuilderReturnVariants.error
    }
  }
}
