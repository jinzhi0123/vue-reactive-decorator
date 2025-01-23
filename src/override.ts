import type { ClassFieldDecorator } from './decorator-fills'
import { createDecorator, type ReactiveDecorator } from './decorator'

const OVERRIDE = 'override'

export function isOverride(decorator: ReactiveDecorator): boolean {
  return decorator.decoratorType === OVERRIDE
}

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor) {
  const initialValue = descriptor.value
  Object.defineProperty(target, key, {
    value: initialValue,
    enumerable: true,
    configurable: true,
  })
}

export const Override = createDecorator<ClassFieldDecorator>({
  decoratorType: OVERRIDE,
  make,
})
