import type { ReactiveDecorator } from './decorator'
import { STORED_METADATA_KEY } from './decorator'
import { addHiddenProp, hasProp } from './utils'

export function isOverridden(decorator: ReactiveDecorator): boolean {
  return decorator.decoratorType === 'override'
}

export function getDecoratorType(decorator: ReactiveDecorator): string {
  return decorator.decoratorType
}

export function storeMetaDataByPrototype(prototype: any, key: PropertyKey, decorator: ReactiveDecorator) {
  if (!hasProp(prototype, STORED_METADATA_KEY)) {
    addHiddenProp(prototype, STORED_METADATA_KEY, {
      ...prototype[STORED_METADATA_KEY],
    })
  }

  if (__DEV__) {
    /**
     * Check if the decorator is 'override' and if the member is not found on prototype.
     */
    if (isOverridden(decorator) && !hasProp(prototype[STORED_METADATA_KEY], key)) {
      const fieldName = `${prototype.constructor.name}.prototype.${key.toString()}`
      if (__DEV__)
        throw new Error(`'${fieldName}' is decorated with 'override', but no such decorated member was found on prototype.`)
    }
    /**
     * Check if the member is already decorated with another decorator.
     */
    if (!isOverridden(decorator) && hasProp(prototype[STORED_METADATA_KEY], key)) {
      const fieldName = `${prototype.constructor.name}.prototype.${key.toString()}`
      const prevType = getDecoratorType(prototype[STORED_METADATA_KEY][key])
      const currentType = getDecoratorType(decorator)

      if (__DEV__)
        throw new Error(`'${fieldName}' is decorated with '${currentType}', but '${prevType}' is already defined.`)
    }
  }

  // if (!isOverridden(decorator))
  prototype[STORED_METADATA_KEY][key] = decorator
}

export type DecoratorMapEntry =
  | ReactiveDecorator

export type DecoratorsMap = Record<PropertyKey, DecoratorMapEntry>

export function collectDecoratorsByPrototype(target: any): DecoratorsMap {
  if (!hasProp(target, STORED_METADATA_KEY)) {
    if (__DEV__ && !target[STORED_METADATA_KEY])
      throw new Error(`No decorators found. Please check if you have used any decorators.`)

    addHiddenProp(target, STORED_METADATA_KEY, {
      ...target[STORED_METADATA_KEY],
    })
  }

  return target[STORED_METADATA_KEY]
}
