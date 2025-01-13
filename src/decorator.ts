import type { Decorator } from './decorator-fills'
import { storeMetaDataByNative } from './store-native'
import { storeMetaDataByPrototype } from './store-prototype'

export const STORED_METADATA_KEY: unique symbol = Symbol('VUE_REACTIVE_DECORATOR_METADATA')

let DECORATOR_VERSION: '2021' | '2023' | undefined

export interface ReactiveDecorator {
  decoratorType: string
  decorate2023?: (value: any, context: DecoratorContext) => void
  decorate2021?: (value: any, propertyKey: string | symbol) => void
  make: (
    target: any,
    key: PropertyKey,
    descriptor: PropertyDescriptor
  ) => any
  options?: any
}

export function createDecorator<D extends Decorator = Decorator>(
  decorator: ReactiveDecorator,
): PropertyDecorator & ReactiveDecorator & D {
  function _decorator(arg1: any, arg2: any) {
    if (is2023Decorator(arg2)) {
      const [value, context] = [arg1, arg2]
      if (DECORATOR_VERSION === undefined)
        DECORATOR_VERSION = '2023'
      // return decorator.decorate2023(decorator, target)
      storeMetaDataByNative(value, context, decorator)
    }
    else {
      // return decorator.decorate2021(decorator, target)
      const [target, property] = [arg1, arg2]
      if (DECORATOR_VERSION === undefined)
        DECORATOR_VERSION = '2021'
      storeMetaDataByPrototype(target, property, decorator)
    }
  }
  return Object.assign(_decorator, decorator) as any
}

export function isReactiveDecorator(thing: any) {
  return (
    thing != null
    && thing instanceof Object
    && typeof thing.decoratorType === 'string'
  )
}

export function assert20223DecoratorType(
  context: DecoratorContext,
  types: DecoratorContext['kind'][],
) {
  if (!types.includes(context.kind)) {
    console.error(
      `The decorator applied to '${String(context.name)}' cannot be used on a ${
        context.kind
      } element`,
    )
  }
}

export function is2023Decorator(context: any): context is DecoratorContext {
  return typeof context == 'object' && typeof context.kind == 'string'
}

export function is2023DecoratorAfterRunning() {
  return DECORATOR_VERSION === '2023'
}
