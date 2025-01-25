// ported from https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts
// and https://github.com/vue-mini/vue-mini/blob/master/packages/core/src/scheduler.ts

import { isArray, NOOP } from './utils'

export enum SchedulerJobFlags {
  // eslint-disable-next-line ts/prefer-literal-enum-member
  QUEUED = 1 << 0,
  // eslint-disable-next-line ts/prefer-literal-enum-member
  ALLOW_RECURSE = 1 << 2,
}

// eslint-disable-next-line ts/no-unsafe-function-type
export interface SchedulerJob extends Function {
  id?: number
  /**
   * flags can technically be undefined, but it can still be used in bitwise
   * operations just like 0.
   */
  flags?: SchedulerJobFlags
}

export type SchedulerJobs = SchedulerJob | SchedulerJob[]

const queue: SchedulerJob[] = []
let flushIndex = -1

const pendingPostFlushCbs: SchedulerJob[] = []
let activePostFlushCbs: SchedulerJob[] | null = null
let postFlushIndex = 0

const resolvedPromise = /* @__PURE__ */ Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

const RECURSION_LIMIT = 100
type CountMap = Map<SchedulerJob, number>

export function nextTick<T = void, R = void>(
  this: T,
  fn?: (this: T) => R,
): Promise<Awaited<R>> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

// 简化
export function queueJob(job: SchedulerJob): void {
  // check if the job is already in the queue
  if (!(job.flags! & SchedulerJobFlags.QUEUED)) {
    queue.push(job)
    // set the job as queued
    job.flags! |= SchedulerJobFlags.QUEUED
    queueFlush()
  }
}

function queueFlush(): void {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

export function queuePostFlushCb(cb: SchedulerJob): void {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb)
    }
    else if (!(cb.flags! & SchedulerJobFlags.QUEUED)) {
      pendingPostFlushCbs.push(cb)
      cb.flags! |= SchedulerJobFlags.QUEUED
    }
  }
  else {
    // if cb is an array, it is a component lifecycle hook which can only be
    // triggered by a job, which is already deduped in the main queue, so
    // we can skip duplicate check here to improve perf
    pendingPostFlushCbs.push(...cb)
  }
  queueFlush()
}

export function flushPostFlushCbs(seen?: CountMap): void {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)]

    // #1947 already has active queue, nested flushPostFlushCbs call
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped)
      return
    }

    activePostFlushCbs = deduped

    if (__DEV__) {
      seen = seen || new Map()
    }

    pendingPostFlushCbs.length = 0

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      const cb = activePostFlushCbs[postFlushIndex]
      if (__DEV__ && checkRecursiveUpdates(seen!, cb)) {
        continue
      }
      if (cb.flags! & SchedulerJobFlags.ALLOW_RECURSE) {
        cb.flags! &= ~SchedulerJobFlags.QUEUED
      }

      // if (!(cb.flags! & SchedulerJobFlags.DISPOSED)) cb()
      cb()
      cb.flags! &= ~SchedulerJobFlags.QUEUED
    }

    activePostFlushCbs = null
    postFlushIndex = 0
  }
}

function flushJobs(seen?: CountMap): void {
  /* istanbul ignore else -- @preserve  */
  if (__DEV__) {
    seen = seen || new Map()
  }

  // conditional usage of checkRecursiveUpdate must be determined out of
  // try ... catch block since Rollup by default de-optimizes treeshaking
  // inside try-catch. This can leave all warning code unshaked. Although
  // they would get eventually shaken by a minifier like terser, some minifiers
  // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
  const check
    = __DEV__
      ? (job: SchedulerJob) => checkRecursiveUpdates(seen!, job)
      : NOOP

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]

      // if (job && !(job.flags! & SchedulerJobFlags.DISPOSED)) {
      if (job) {
        if (__DEV__ && check(job)) {
          continue
        }

        if (job.flags! & SchedulerJobFlags.ALLOW_RECURSE) {
          job.flags! &= ~SchedulerJobFlags.QUEUED
        }

        job()
        if (!(job.flags! & SchedulerJobFlags.ALLOW_RECURSE)) {
          job.flags! &= ~SchedulerJobFlags.QUEUED
        }
      }
    }
  }
  finally {
    // If there was an error we still need to clear the QUEUED flags
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job) {
        job.flags! &= ~SchedulerJobFlags.QUEUED
      }
    }

    flushIndex = -1
    queue.length = 0

    flushPostFlushCbs(seen)

    currentFlushPromise = null

    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen)
    }
  }
}

function checkRecursiveUpdates(seen: CountMap, fn: SchedulerJob): boolean {
  const count = seen.get(fn) || 0
  /* istanbul ignore if -- @preserve */
  if (count > RECURSION_LIMIT) {
    console.warn(
      `Maximum recursive updates exceeded. `
      + `This means you have a reactive effect that is mutating its own `
      + `dependencies and thus recursively triggering itself.`,
    )
    return true
  }

  seen.set(fn, count + 1)
  return false
}
