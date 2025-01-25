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
  is2023DecoratorAfterRunning as is2023Decorator,
  isReactiveDecorator,
  ReactiveDecorator,
} from './decorator'

export {
  makeObservable,
} from './makeObservable'

// export {
//   isOverride,
//   Override,
// } from './override'

export {
  IObservableFactory,
  isObservable,
  Observable,
} from './observable'

export {
  isWatch,
  Watch,
} from './watch'

export {
  isWatchEffect,
  WatchEffect,
  WatchSyncEffect,
} from './watchEffect'
