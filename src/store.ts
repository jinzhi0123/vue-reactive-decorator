import { is2023Decorator, is2023DecoratorAfterRunning } from './decorator'
import { collectDecoratorsByNative, storeMetaDataByNative } from './store-native'
import { collectDecoratorsByPrototype, storeMetaDataByPrototype } from './store-prototype'

export function storeMetaData(...args:
  Parameters<typeof storeMetaDataByPrototype> |
  Parameters<typeof storeMetaDataByNative>) {
  const [target, property, decorator] = args
  if (is2023Decorator(property))
    return storeMetaDataByNative(target, property, decorator)
  else
    return storeMetaDataByPrototype(target, property, decorator)
}

export function collectDecorators(...args:
  Parameters<typeof collectDecoratorsByPrototype> |
  Parameters<typeof collectDecoratorsByNative>) {
  const [target] = args
  if (is2023DecoratorAfterRunning())
    return collectDecoratorsByNative(target)
  else
    return collectDecoratorsByPrototype(target)
}
