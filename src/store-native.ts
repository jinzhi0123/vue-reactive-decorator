import type { ReactiveDecorator } from './decorator'
import type { DecoratorsMap } from './store-prototype'
import { STORED_METADATA_KEY } from './decorator'

export function storeMetaDataByNative(value: any, context: DecoratorContext, decorator: ReactiveDecorator) {
  const metadata = context.metadata
  const fieldName = (context.name ?? 'unknown').toString()
  if (__DEV__ && isOverridden(decorator) && !hasProp(metadata, STORED_METADATA_KEY)) {
    throw new Error(`'${fieldName}' is decorated with 'override', `
      + `but no such decorated member was found on prototype.`)
  }

  if (!hasProp(metadata, STORED_METADATA_KEY)) {
    addProp(metadata, STORED_METADATA_KEY, {})
  }

  // if (!isOverridden(decorator))
  (metadata as any)[STORED_METADATA_KEY][context.name!] = decorator
}

export function getMetaDataByNative(instance: object) {
  const metaData = instance.constructor[Symbol.metadata]
  if (!metaData || !metaData[STORED_METADATA_KEY])
    throw new Error('Decorator metadata is not defined')
  return metaData[STORED_METADATA_KEY]
}

function hasProp(target: any, key: PropertyKey) {
  return key in target
}

function addProp(target: any, key: PropertyKey, value: any) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value,
  })
}

function isOverridden(decorator: ReactiveDecorator): boolean {
  return decorator.decoratorType === 'override'
}

export function collectDecoratorsByNative(instance: any): DecoratorsMap {
  const metadata = instance.constructor[Symbol.metadata]
  if (!metadata)
    throw new Error('Decorator metadata is not defined')
  return metadata[STORED_METADATA_KEY]
}
