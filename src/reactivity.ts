// ported from https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiWatch.ts
// and https://github.com/vue-mini/vue-mini/blob/master/packages/core/src/watch.ts

import type {
  WatchOptions as BaseWatchOptions,
  DebuggerOptions,
  ReactiveMarker,
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchSource,
} from '@vue/reactivity'
import type { SchedulerJob } from './scheduler'
import { watch as baseWatch } from '@vue/reactivity'
import { queueJob, queuePostFlushCb, SchedulerJobFlags } from './scheduler'
import { isFunction } from './utils'

export type {
  OnCleanup,
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchSource,
  WatchStopHandle,
} from '@vue/reactivity'

type MaybeUndefined<T, I> = I extends true ? T | undefined : T

type MapSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ?
    MaybeUndefined<V, Immediate>
    : T[K] extends object ? MaybeUndefined<T[K], Immediate>
      : never
}

export interface WatchEffectOptions extends DebuggerOptions {
  flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchEffectOptions {
  immediate?: Immediate
  deep?: boolean | number
  once?: boolean
}

// Simple effect.
export function watchEffect(
  effect: WatchEffect,
  options?: WatchEffectOptions,
): WatchHandle {
  return doWatch(effect, null, options)
}

export function watchPostEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__
      ? { ...options, flush: 'post' }
      : { flush: 'post' },
  )
}

export function watchSyncEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__
      ? { ...options, flush: 'sync' }
      : { flush: 'sync' },
  )
}

export type MultiWatchSources = Array<WatchSource<unknown> | object>

// overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, MaybeUndefined<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// overload: reactive array or tuple of multiple sources + cb
export function watch<
  T extends Readonly<MultiWatchSources>,
  Immediate extends Readonly<boolean> = false,
>(
  sources: readonly [...T] | T,
  cb: [T] extends [ReactiveMarker] ?
    WatchCallback<T, MaybeUndefined<T, Immediate>>
    : WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// overload: array of multiple sources + cb
export function watch<
  T extends MultiWatchSources,
  Immediate extends Readonly<boolean> = false,
>(
  sources: [...T],
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// overload: watching reactive object w/ cb
export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false,
>(
  source: T,
  cb: WatchCallback<T, MaybeUndefined<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>,
): WatchHandle {
  if (__DEV__ && !isFunction(cb)) {
    console.warn(
      `\`watch(fn, options?)\` signature has been moved to a separate API. `
      + `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only `
      + `supports \`watch(source, cb, options?) signature.`,
    )
  }

  return doWatch(source as any, cb, options)
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  options: WatchOptions = {},
): WatchHandle {
  const { immediate, deep, flush, once } = options

  if (__DEV__ && !cb) {
    if (immediate !== undefined) {
      console.warn(
        `watch() "immediate" option is only respected when using the `
        + `watch(source, callback, options?) signature.`,
      )
    }

    if (deep !== undefined) {
      console.warn(
        `watch() "deep" option is only respected when using the `
        + `watch(source, callback, options?) signature.`,
      )
    }

    if (once !== undefined) {
      console.warn(
        `watch() "once" option is only respected when using the `
        + `watch(source, callback, options?) signature.`,
      )
    }
  }

  const baseWatchOptions: BaseWatchOptions = { ...options }

  // scheduler
  if (flush === 'post') {
    baseWatchOptions.scheduler = (job) => {
      queuePostFlushCb(job)
    }
  }
  else if (flush !== 'sync') {
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job()
      }
      else {
        queueJob(job)
      }
    }
  }

  // @ts-expect-error scheduler is not part of the public API
  baseWatchOptions.augmentJob = (job: SchedulerJob) => {
    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger
    if (cb) {
      job.flags! |= SchedulerJobFlags.ALLOW_RECURSE
    }
  }

  const watchHandle = baseWatch(source, cb, baseWatchOptions)

  return watchHandle
}
