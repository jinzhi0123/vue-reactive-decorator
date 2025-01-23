import type { Ref, ShallowRef } from 'vue-demi'
import type { ReactiveDecorator } from './decorator'
import type { ClassFieldDecorator } from './decorator-fills'
import { reactive, ref, shallowReactive, shallowRef } from 'vue-demi'
import { createDecoratorTypeChecker } from './adm'
import { createDecorator } from './decorator'

export interface IObservableFactory extends ReactiveDecorator, PropertyDecorator, ClassFieldDecorator {
  ref: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
  shallowRef: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
  reactive: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
  shallowReactive: ReactiveDecorator & PropertyDecorator & ClassFieldDecorator
}

interface CreateObservableOptions {
  ref: boolean
  deep: boolean
}

export function createObservable(name: string, options: CreateObservableOptions): ReactiveDecorator {
  return {
    decoratorType: name,
    make: (target: any, key: PropertyKey, descriptor: PropertyDescriptor) => make(target, key, descriptor, options),
    options,
  }
}

function make(target: any, key: PropertyKey, descriptor: PropertyDescriptor, options: CreateObservableOptions) {
  if (
    __DEV__
    && (!('value' in descriptor) || typeof descriptor.value === 'function')
  ) {
    throw new Error(`@observable can only be used with non-function properties.`)
  }

  const initialValue = descriptor.value

  if (options.ref === true) {
    let refValue: ShallowRef | Ref

    if (options.deep === true)
      refValue = ref(initialValue)
    else
      refValue = shallowRef(initialValue)

    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        return refValue.value
      },
      set(v: any) {
        refValue.value = v
      },
    })
  }
  else {
    let reactiveValue: any

    if (options.deep === true)
      reactiveValue = reactive(initialValue)
    else
      reactiveValue = shallowReactive(initialValue)

    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        return reactiveValue
      },
      set(v: any) {
        reactiveValue = v
      },
    })
  }
}

const observableDecorator = createObservable('observable', { ref: true, deep: true })
const observableShallowRefDecorator = createObservable('observable.shallowRef', { ref: true, deep: false })
const observableShallowReactiveDecorator = createObservable('observable.shallowReactive', { ref: false, deep: false })
const observableReactiveDecorator = createObservable('observable.reactive', { ref: false, deep: true })

const _observable = createDecorator(observableDecorator)

const observableFactories: IObservableFactory = {
  shallowRef: createDecorator(observableShallowRefDecorator),
  ref: _observable,
  shallowReactive: createDecorator(observableShallowReactiveDecorator),
  reactive: createDecorator(observableReactiveDecorator),
} as any

export const Observable: IObservableFactory = Object.assign(_observable, observableFactories)

/*
Considering two schemes:
1. Using a function to create decorator type checkers for each decorator type.
2. Code respectively for each decorator type

export function isObservable(decorator: ReactiveDecorator): boolean
export function isObservable<T extends object>(target: T, key: keyof T): boolean

export function isObservable<T extends object>(arg1: ReactiveDecorator | T, arg2?: keyof T): boolean {
  if (isReactiveDecorator(arg1)) {
    return arg1.decoratorType === 'observable'
  }
  if (arg2 !== undefined) {
    const [target, key] = [arg1, arg2]
    const records = getAdministration(target)
    const decorator = records[key]?.decorator
    return decorator ? isObservable(decorator) : false
  }

  return false
}
*/
export const isObservable = createDecoratorTypeChecker(
  (decorator: ReactiveDecorator) => decorator.decoratorType.match(/^observable/) !== null,
)
