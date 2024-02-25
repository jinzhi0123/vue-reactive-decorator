import { watchEffect as vWatchEffect } from 'vue-demi'
import { createDecorator } from './decorator'
import type { ClassMethodDecorator } from './decorator-fills'
import { getEffectScope } from './effectScope'

const WATCH_EFFECT = 'watchEffect'

// can only be used on class methods

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value !== 'function')
  )
    throw new Error(`@watchEffect can only be used with methods.`)

  const effectScope = getEffectScope(target)

  effectScope.run(() => {
    vWatchEffect(descriptor.value.bind(target))
  })
}

export const watchEffect = createDecorator<ClassMethodDecorator>({
  decoratorType: WATCH_EFFECT,
  make,
})
