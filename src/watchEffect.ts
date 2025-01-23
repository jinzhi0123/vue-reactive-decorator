import type { ReactiveDecorator } from './decorator'
import type { ClassMethodDecorator } from './decorator-fills'
import { watchEffect as vWatchEffect, watchSyncEffect as vWatchSyncEffect } from 'vue-demi'
import { createDecoratorTypeChecker } from './adm'
import { createDecorator } from './decorator'
import { getEffectScope } from './effectScope'

const WATCH_EFFECT = 'watchEffect'

const WATCH_SYNC_EFFECT = 'watchEffect.sync'

// can only be used on class methods

interface CreateWatchEffectOptions {
  sync: boolean
}

function createWatchEffectDecorator(name: string, options: CreateWatchEffectOptions): ReactiveDecorator {
  return {
    decoratorType: name,
    make: (target: any, key: PropertyKey, descriptor: PropertyDescriptor) => make(target, key, descriptor, options),
    options,
  }
}

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor, options: CreateWatchEffectOptions) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value !== 'function')
  ) {
    throw new Error(`@watchEffect can only be used with methods.`)
  }

  const effectScope = getEffectScope(target)

  if (options.sync) {
    effectScope.run(() => {
      vWatchSyncEffect(descriptor.value.bind(target))
    })
  }
  else {
    effectScope.run(() => {
      vWatchEffect(descriptor.value.bind(target))
    })
  }
}

export const WatchEffect = createDecorator<ClassMethodDecorator>(
  createWatchEffectDecorator(
    WATCH_EFFECT,
    { sync: false },
  ),
)

export const WatchSyncEffect = createDecorator<ClassMethodDecorator>(
  createWatchEffectDecorator(
    WATCH_SYNC_EFFECT,
    { sync: true },
  ),
)

export const isWatchEffect = createDecoratorTypeChecker(
  (decorator: ReactiveDecorator) => decorator.decoratorType.match(/^watchEffect/) !== null,
)
