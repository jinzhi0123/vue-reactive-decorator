import type { WatchCallback, WatchOptions } from 'vue-demi'
import type { ClassMethodDecorator } from './decorator-fills'
import { watch as vWatch } from 'vue-demi'
import { createDecoratorTypeChecker } from './adm'
import { createDecorator, type ReactiveDecorator } from './decorator'
import { getEffectScope } from './effectScope'
import { isObservable } from './observable'

const WATCH = 'watch'

export const isWatch = createDecoratorTypeChecker(
  (decorator: ReactiveDecorator) => decorator.decoratorType === WATCH,
)

type WatchSourceFunction<TTarget extends object, TValue> = (this: TTarget) => TValue
type WatchSourceProperty<TTarget, TKey extends keyof TTarget> = TKey

type DecoratorWatchSource<TTarget extends object, TKey extends keyof TTarget, Tvalue> =
  | WatchSourceFunction<TTarget, Tvalue>
  | WatchSourceProperty<TTarget, TKey>

interface CreateWatchOptions<TTarget extends object, TKey extends keyof TTarget, TValue> {
  source: DecoratorWatchSource<TTarget, TKey, TValue>
  watchOptions?: WatchOptions
}

interface EffectDescriptor<T> extends PropertyDescriptor {
  value?: WatchCallback<T>
}

function make<
  TTarget extends object,
  TKey extends keyof TTarget,
  TValue,
>(target: TTarget, key: PropertyKey, descriptor: EffectDescriptor<any>, options: CreateWatchOptions<TTarget, TKey, TValue>) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value !== 'function')
  ) {
    throw new Error(`@watch can only be used with methods.`)
  }
  const effectScope = getEffectScope(target)

  const { watchOptions } = options

  const source
  = typeof options.source === 'function'
    ? options.source.bind(target)
    : options.source

  if (!source) {
    throw new Error(`@watch source is not defined.`)
  }

  const callback = descriptor.value?.bind(target)

  if (callback === undefined) {
    throw new Error(`@watch callback is not defined.`)
  }

  if (typeof source == 'function') {
    effectScope.run(() => {
      vWatch(source, callback, watchOptions)
    })
  }
  else if (typeof source == 'string' || typeof source == 'symbol' || typeof source == 'number') {
    if (!(source in target)) {
      throw new Error(`@watch source '${source.toString()}' is not defined in the target.`)
    }
    if (!isObservable(target, source)) {
      throw new Error(`@watch source '${source.toString()}' is not observable.`)
    }
    effectScope.run(() => {
      vWatch(() => target[source], callback, watchOptions)
    })
  }
}

function createWatchDecorator<
  TTarget extends object,
  TKey extends keyof TTarget,
  TValue,
>(name: string, options: CreateWatchOptions<TTarget, TKey, TValue>): ReactiveDecorator {
  return {
    decoratorType: name,
    make: (target: TTarget, key: PropertyKey, descriptor: EffectDescriptor<TValue>) => make(target, key, descriptor, options),
    options,
  }
}

export function watch<
  TTarget extends object,
  TKey extends keyof TTarget,
  TValue = TTarget[TKey],
  TCallback extends WatchCallback<TValue> = WatchCallback<TValue>,
>(source: TKey, options?: WatchOptions): ClassMethodDecorator<TTarget, TCallback>

export function watch<
  TTarget extends object,
  TValue,
  TCallback extends WatchCallback<TValue> = WatchCallback<TValue>,
>(source: ((this: TTarget) => TValue), options?: WatchOptions): ClassMethodDecorator<TTarget, TCallback>

export function watch<
  TTarget extends object,
  TKey extends keyof TTarget,
  TValue = TTarget[TKey],
  TCallback extends WatchCallback<TValue> = WatchCallback<TValue>,
>(source: TKey | ((this: TTarget) => TValue), options?: WatchOptions): ClassMethodDecorator<TTarget, TCallback> {
  return createDecorator<ClassMethodDecorator<TTarget, TCallback>>(
    createWatchDecorator<TTarget, TKey, TValue>(
      WATCH,
      { source, watchOptions: options },
    ),
  )
}
