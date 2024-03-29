import { computed as vComputed } from 'vue-demi'
import { type ReactiveDecorator, createDecorator } from './decorator'
import type { ClassGetterDecorator } from './decorator-fills'
import { getEffectScope } from './effectScope'
import { NOOP } from './utils'

const COMPUTED = 'computed'

export function isComputed(decorator: ReactiveDecorator): boolean {
  return decorator.decoratorType === COMPUTED
}

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor) {
  /**
   * Cannot be used on static member.
   * Can only be used on getter.
   */
  if (typeof target === 'function')
    throw new Error('computed cannot be used on static member')

  if (
    descriptor == null
    || typeof descriptor !== 'object'
    || typeof descriptor.get !== 'function'
  )
    throw new Error('computed can only be used on getter')

  const effectScope = getEffectScope(target)

  const value = effectScope.run(() =>
    vComputed(
      {
        get: descriptor.get!.bind(target),
        set: descriptor.set?.bind(target) ?? NOOP,
      },
    ),
  )!

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    get() {
      return value.value
    },
    set: descriptor.set && (val => (value.value = val)),
  })
}

export const computed = createDecorator<ClassGetterDecorator>({
  decoratorType: COMPUTED,
  make,
})
