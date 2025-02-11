import { build as viteBuild, type InlineConfig } from 'vite'
import {
  type FeExecSignalingError, type FeExecSignalingErrorCodes,
  _feIsObject, _feIsEmptyObject,
  _feAssertIsObject, _feAssertIsAsyncFunction,
} from '../../../../fe3/src/index.ts'
import type {
  BuiqVitexExecCtx, BuiqVitexConfig, BuiqExitCode,
  ViteCommonConfigFnProps, ViteLocalConfigFnProps,
} from './types'
import { DefaultsProfileNames } from './defaults-n-profiles.ts'
import { BuildSequencer } from '../abstract/core.ts'
// import { FeBuilderRunnerCtx } from '../abstract/runner.ts'

type __BuilderCtx = {}

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

export async function vitexBuilder (
  props: Partial<BuiqVitexExecCtx>
): Promise<BuiqExitCode> {

  const ctx: BuiqVitexExecCtx = {
    ...props,
    mode: 'build',
    shared: {
      ...props.shared,
      files: {
        ...props.shared?.files
      }
    },
    local: {
      ...props.local,
      files: {
        ...props.local?.files
      }
    },
  }

  const r = new BuildSequencer<
    BuiqVitexExecCtx,
    BuiqVitexConfig
  >(
    'vite', // '_',
    ctx,
    {
      blockstoExecasFunctions: {
        pre: (c: BuiqVitexExecCtx)=> (0 as unknown as Promise<BuiqVitexExecCtx>)
      }
    }
  )

  const {
    catchComm: _c,
    prompt: p,
    color: co
  } = await r.ctxSignals.sequencerReady.tillReady // returns utilities


  try {
    r.loadConfigs()
    r.exec()
  } catch(err: FeExecSignalingError) {

  }

    // now we parse different build and vite configs possibly coming from different sources

  // async function sharedConfig (
  //   ctx: __BuilderCtx
  // ) {

  try {

    // Config/bundler: (shared vite config)
    try {
      // loading local vite config
      await r.execSignals.config_c_bundler_local.tillRequested // returns ctx
      _c.framingMessage =
        `Failed importing the local vite config ts (${ctx.local.files.bundler})`
      if (!ctx.local.files.bundler) {
        p.log.warn('Local vite config ts can not be determined. \n' +
          'If this is not how you intended it to be, please check the defaults and other related settings.')
      } else {
        const viteLocalConfigFn = await import(ctx.local.files.bundler)
        _feAssertIsAsyncFunction<InlineConfig,[ViteLocalConfigFnProps]>(
          viteLocalConfigFn,
          {message: 'Local vite config is not a function'}
        )
      }
      r.execSignals.config_c_bundler_local.done(ctx)
    } catch(err) {
      if (!(err as FeExecSignalingError).execSignaling)
        throw err
    }

    try {
      // loading shared vite config
      await r.execSignals.config_d_bundler_shared.tillRequested // returns ctx
      _c.framingMessage =
        `Failed consuming a proper common (not the local one) vite config ts (provided by the user script)`
      if (props?.viteCommonConfigFn === null) {
        p.log.warn('Common vite config (which isn\'t the local one) ts was not provided (by the user scipt)')
      } else {
        _feAssertIsAsyncFunction<InlineConfig,[ViteCommonConfigFnProps]>(
          props?.viteCommonConfigFn,
          {message: 'What was proviced as a common vite config is not a function (specify as null if omitted)'}
        )
      }

      r.execSignals.config_d_bundler_shared.done(ctx)
    } catch(err) {
      if (!(err as FeExecSignalingError).execSignaling)
        throw err
    }


    if (ctx.viteCommonConfigFn !== null) { // if not a function, that should've caused panic above
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
        :
        {}
    }

    r.execSignals.pre.done(ctx)

  // async function local (
  //   ctx: __BuilderCtx
  // ) {


      _c.framingMessage = `Failed at vite-local-config function`
      viteConfig = await viteLocalConfigFn({
        mode: 'build',
        config: builderConfig,
        resolve,
        _prompt
      })
    }



  // async function main (
  //   ctx: __BuilderCtx
  // ) {

    await viteBuild({
      ...viteConfig,
      configFile: false,
    })
  }

    // return await returnCode
}
