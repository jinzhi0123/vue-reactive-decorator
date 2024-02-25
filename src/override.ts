import { type ReactiveDecorator, createDecorator } from './decorator'
import type { ClassFieldDecorator } from './decorator-fills'

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

export const override = createDecorator<ClassFieldDecorator>({
  decoratorType: OVERRIDE,
  make,
})
