import type { ReactiveDecorator } from './decorator'
import { collectDecorators } from './store'
import { addHiddenProp, getDescriptor, hasProp } from './utils'

export const STORED_ADM_KEY = Symbol('VUE_REACTIVE_STORED_ADM')

export class ObservableObjectAdministration {
  target: any
  records: Record<PropertyKey, {
    raw: any
    decorator: ReactiveDecorator
  }> = {}

  constructor(target: any) {
    this.target = target
    this.records = getAdministration(target) ?? {}
  }

  getRecord(key: PropertyKey) {
    return this.records[key]
  }

  setRecord(key: PropertyKey, value: any, decorator: ReactiveDecorator) {
    this.records[key] = {
      raw: value,
      decorator,
    }
  }

  make(key: PropertyKey, decorator: ReactiveDecorator) {
    if (!(key in this.target)) {
      if (key in collectDecorators(this.target)) {
        // the key may be defined in the child class
        return
      }
      else {
        throw new Error(
          `${key.toString()}@${decorator.decoratorType} cannot be used on non-existent member.`,
        )
      }
    }

    const record = this.getRecord(key)

    if (record) {
      // already been made
      if (record.decorator === decorator) {
        // the same decorator
        return
      }
      if (record.decorator !== decorator) {
        // the different decorator
        throw new Error(`property ${String(key)} already been decorated by ${record.decorator.decoratorType}`)
      }
    }

    // have not been made
    const descriptor = getDescriptor(this.target, key)
    if (descriptor) {
      if (!descriptor.configurable)
        throw new Error(`property ${String(key)} is not configurable.`)
    }
    if (!descriptor)
      throw new Error(`property ${String(key)} is not defined.`)

    const value = decorator.make(this.target, key, descriptor)
    this.setRecord(key, value, decorator)
  }
}
export interface IIsObservableObject {
  [STORED_ADM_KEY]: ObservableObjectAdministration
}

export function asObservableObject(target: any): IIsObservableObject {
  return {
    [STORED_ADM_KEY]: new ObservableObjectAdministration(target),
  }
}

export function getAdministration(target: any): Record<
  PropertyKey,
  {
    raw: any
    decorator: ReactiveDecorator
  }
> {
  if (!hasProp(target, STORED_ADM_KEY))
    addHiddenProp(target, STORED_ADM_KEY, {})

  return target[STORED_ADM_KEY]
}
