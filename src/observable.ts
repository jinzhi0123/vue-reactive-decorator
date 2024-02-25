import { isReactive, ref } from 'vue-demi'
import type { ReactiveDecorator } from './decorator'
import { createDecorator } from './decorator'
import type { ClassFieldDecorator } from './decorator-fills'

export interface IObservableFactory extends ReactiveDecorator, PropertyDecorator, ClassFieldDecorator {
  deep: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
  shallow: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
}

export function createObservable(name: string, options?: object): ReactiveDecorator {
  return {
    decoratorType: name,
    make,
    options,
  }
}

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value === 'function')
  )
    throw new Error(`@observable can only be used with non-function properties.`)

  const initialValue = descriptor.value
  const value = ref(initialValue)

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return value.value
    },
    set(v: any) {
      value.value = v
    },
  })
}

const observableDecorator = createObservable('observable')
const observableShallowDecorator = createObservable('observable.shallow', { deep: false })

const _observable = createDecorator(observableDecorator)

const observableFactories: IObservableFactory = {
  shallow: createDecorator(observableShallowDecorator),
  deep: _observable,
} as any

export const observable: IObservableFactory = Object.assign(_observable, observableFactories)
