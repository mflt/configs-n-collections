import { build as viteBuild, type InlineConfig, type UserConfig } from 'vite'
import {
  type FeExecSignalingError, type FeExecSignalingErrorCodes,
  _feIsObject, _feIsEmptyObject, $fe,
  _feAssertIsObject, _feAssertIsAsyncFunction,
} from '@mflt/_fe'
import type {
  VitexJobTerms, BuiqExitCode, VitexBuilderSlotsAndOptions, ViteLocalSetup,
  ViteSharedSetup, VitexSpecificFeSlotsAndOptions
} from './types.ts'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'
import { BuildSequencer, prompt, color, builderEntryLoaded } from '../abstract/core.ts'
import { BuiqExitCodeVariants } from '../abstract/defaults-n-prototypes.ts'
// import { FeBuilderRunnerCtx } from '../abstract/runner.ts'

export { prompt, color, builderEntryLoaded, $fe }

//  Loading and execution oder:
//  Loading order:
//  common build config and common vite fn preloaded by the calling script
//  command line args
//  (change of cwd if requested in command line args or the cb in the common build config ts)
//  local/cwd package.json (assumed to exist)
//  local/cwd build config (toml)
//  local/cwd vite ts (function)
//  Exec order (post loading):
//  tsc with the tsc config path calculated from the config
//  common vite fn evaluated
//  local/cwd vite fn evaluated
//  vite build ran

builderEntryLoaded.pass('vite-x')

export async function vitexBuilder (
  props: VitexBuilderSlotsAndOptions
): Promise<BuiqExitCode> {

  const { execMods, ...propsFeInit  } = props
  const ctx = {
    // local and shared slots are treated by the core
    [$fe]: propsFeInit,
  } as VitexJobTerms

  const r = new BuildSequencer< // 
    VitexSpecificFeSlotsAndOptions,
    ViteLocalSetup,
    ViteSharedSetup
  >(
    'vite-x', // '_',
    // @TODO let there be a builder kind, like 'vite' and sub like 'vxrn'
    ctx,
    {
      ...execMods
      // blockstoExecasFunctions: {
      //   preps: (c: BuiqVitexExecCtx)=> (0 as unknown as Promise<BuiqVitexExecCtx>)
      // }
    }
  )

  const sq = this
  const squ = await sq.ctxSignals.sequencerReady.tillReady // returns utilities

  try {
    // @TODO run a check if level1 has blocks ordered properly, and other structural checks
    level1()  // throws
    // Playbook:
    // * see __BlocksKeysDonor in the abstract defaults
    // *

    // await sq.loadConfigs()
    // return await sq.exec()
    return 111
  } catch(err) {
    return BuiqExitCodeVariants.error
  }

    // now we parse different build and vite configs possibly coming from different sources

  async function level1 () {
    // Provides:
    // * setup_c_bundler_local
    // * setup_d_bundler_shared

    // Config/bundler: (local vite config)
    try {
      // loading local vite config
      console.log('TILL', sq.execSignals.setup_c_bundler_local.status)
      await sq.execSignals.setup_c_bundler_local.tillRequested // returns ctx
      console.log('TILL AFTER')
      squ.c4.throwwith =
        `Failed importing the local vite config ts (${ctx[$fe].files?.bundler || '(see the bundler property'})`
      if (!(ctx[$fe].files?.bundler)) {
        squ.prompt.log.warn('Local vite config ts can not be determined. \n' +
          'If this is not how you intended it to be, please check the defaults and other related settings.')
      } else {
        const viteLocalConfigFn = await import(ctx[$fe].files?.bundler)
        _feAssertIsAsyncFunction<InlineConfig,[ViteLocalSetup]>(
          viteLocalConfigFn,
          {message: 'Local vite config is not a function'}
        )
      }
      sq.execSignals.setup_c_bundler_local.done(ctx)
    } catch(err) {
      if (!(err as FeExecSignalingError).execSignaling)
        throw err
    }

    // Config/bundler: (shared/common vite config)
    try {
      // loading shared vite config
      await sq.execSignals.setup_d_bundler_shared.tillRequested // returns ctx
      squ.c4.throwwith =
        `Failed consuming a proper common (not the local one) vite config ts (provided by the user script)`
      if (props?.viteSharedConfigFn === null) {
        // @TODO implement loading config from file in dyn import mode
        p.log.warn('Common vite config (which isn\'t the local one) ts was not provided (by the user scipt)')
      } else {
        // const viteCommonConfigFn = await import(ctx.shared.files.bundler) // @TODO implement the loading case
        _feAssertIsAsyncFunction<UserConfig,[ViteSharedSetup]>(
          props?.viteSharedConfigFn,
          {message: 'What was proviced as a common vite config is not a function (specify as null if omitted)'}
        )
      }

      sq.execSignals.setup_d_bundler_shared.done(ctx)
    } catch(err) {
      if (!(err as FeExecSignalingError).execSignaling)
        throw err
    }


    if (ctx.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
      p.log.step(`evaluating common config`)

      squ.c4.throwwith = `Failed at vite-common-config function`
      builderConfig.viteCommonConfig = props.viteCommonConfigFn // assumed to be a function if not null
        ?
        await props.viteCommonConfigFn({
          mode: 'build',
          config: builderConfig,
          resolve,
          _prompt
        })
        :
        {}
    }

    // sq.execSignals.pre.done(ctx)

  // async function local (
  //   ctx: __BuilderCtx
  // ) {


      squ.c4.throwwith = `Failed at vite-local-config function`
      viteConfig = await viteLocalConfigFn({
        mode: 'build',
        config: builderConfig,
        resolve,
        _prompt
      })




  // async function main (
  //   ctx: __BuilderCtx
  // ) {

    await viteBuild({
      ...viteConfig,
      configFile: false,
    })
  }

}
