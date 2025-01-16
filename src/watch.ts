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

type DecoratorWatchSource<T> = ((this: T) => any) | keyof T

interface CreateWatchOptions<T> {
  source: DecoratorWatchSource<T>
}

function make<T extends object>(target: T, key: PropertyKey, descriptor: PropertyDescriptor, options: CreateWatchOptions<T>) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value !== 'function')
  ) {
    throw new Error(`@watch can only be used with methods.`)
  }

  const effectScope = getEffectScope(target)

  const source
    = typeof options.source === 'function'
      ? options.source.bind(target)
      : options.source

  if (!source) {
    throw new Error(`@watch source is not defined.`)
  }

  if (typeof source == 'function') {
    effectScope.run(() => {
      vWatch(source, descriptor.value.bind(target))
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
      vWatch(() => target[source], descriptor.value.bind(target))
    })
  }
}

function createWatchDecorator<T extends object>(name: string, options: CreateWatchOptions<T>): ReactiveDecorator {
  return {
    decoratorType: name,
    make: (target: T, key: PropertyKey, descriptor: PropertyDescriptor) => make(target, key, descriptor, options),
    options,
  }
}

export function watch<T extends object = any>(source: DecoratorWatchSource<T>) {
  return createDecorator<ClassMethodDecorator>(
    createWatchDecorator<T>(
      WATCH,
      { source },
    ),
  )
}
