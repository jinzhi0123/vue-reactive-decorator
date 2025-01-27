// runtime polyfill
if (typeof Symbol.metadata === 'undefined') {
  // @ts-expect-error runtime polyfill
  Symbol.metadata = Symbol('Symbol.metadata')
}

export {
  IIsObservableObject,
} from './adm'

export {
  Computed,
  isComputed,
} from './computed'

export {
  is2023Decorator,
  isReactiveDecorator,
  ReactiveDecorator,
} from './decorator'

export {
  getEffectScope,
} from './effectScope'

// export {
//   isOverride,
//   Override,
// } from './override'

export {
  makeObservable,
} from './makeObservable'

export {
  IObservableFactory,
  isObservable,
  Observable,
} from './observable'

export {
  OnCleanup,
  WatchCallback,
  WatchHandle,
  WatchOptions,
  WatchSource,
  WatchStopHandle,
} from './reactivity'

export {
  nextTick,
} from './scheduler'

export {
  isWatch,
  Watch,
} from './watch'

export {
  isWatchEffect,
  WatchEffect,
  WatchSyncEffect,
} from './watchEffect'
