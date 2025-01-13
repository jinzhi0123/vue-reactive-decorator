import { asObservableObject, STORED_ADM_KEY } from './adm'
import { collectDecorators } from './store'
import { ownKeys } from './utils'

export function makeObservable<T extends object>(target: T): T {
  const decorators = collectDecorators(target)

  const adm = asObservableObject(target)[STORED_ADM_KEY]

  ownKeys(decorators).forEach((key) => {
    const decorator = decorators[key]
    // const descriptor = getDescriptor(target, key)
    adm.make(key, decorator)
  })
  return target
}
