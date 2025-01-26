import type { ReactiveDecorator } from './decorator'
import { asObservableObject, STORED_ADM_KEY } from './adm'
import { isComputed } from './computed'
import { isObservable } from './observable'
import { collectDecorators } from './store'
import { ownKeys } from './utils'
import { isWatch } from './watch'
import { isWatchEffect } from './watchEffect'

type DecoratorType = 'observable' | 'computed' | 'watch'

interface DecoratorRecord {
  key: PropertyKey
  decorator: ReactiveDecorator
  type: DecoratorType
}

function getDecoratorType(decorator: ReactiveDecorator): DecoratorType | null {
  if (isObservable(decorator))
    return 'observable'
  if (isComputed(decorator))
    return 'computed'
  if (isWatch(decorator) || isWatchEffect(decorator))
    return 'watch'
  return null
}

export function makeObservable<T extends object>(target: T): T {
  const decorators = collectDecorators(target)
  const adm = asObservableObject(target)[STORED_ADM_KEY]

  const decoratorRecords = ownKeys(decorators)
    .map(key => ({
      key,
      decorator: decorators[key],
      type: getDecoratorType(decorators[key]),
    }))
    .filter((record): record is DecoratorRecord => record.type !== null)
    .sort((a, b) => {
      const order = { observable: 0, computed: 1, watch: 2 }
      return order[a.type] - order[b.type]
    })

  decoratorRecords.forEach(({ key, decorator }) => {
    adm.make(key, decorator)
  })

  return target
}
