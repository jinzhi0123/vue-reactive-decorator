const objectPrototype = Object.prototype
const hasGetOwnPropertySymbols = typeof Object.getOwnPropertySymbols !== 'undefined'

export function hasProp(target: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export function addHiddenProp(target: object, key: PropertyKey, value: any) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value,
  })
}

export function isPropertyKey(key: any): key is PropertyKey {
  switch (typeof key) {
    case 'string':
    case 'number':
    case 'symbol':
      return true
    default:
      return false
  }
}

export function assertPropertyDecorator(name: string, args: any[]) {
  if (args.length < 2 || typeof args[0] !== 'object' || !isPropertyKey(args[1]))
    throw new TypeError(`@${name} decorator can only be used on properties.`)
}

export function NOOP() {}

export const ownKeys: (target: any) => PropertyKey[]
  = typeof Reflect !== 'undefined' && Reflect.ownKeys
    ? Reflect.ownKeys
    : hasGetOwnPropertySymbols
      ? obj => Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj) as any)
      : /* istanbul ignore next */ Object.getOwnPropertyNames

export function getDescriptor(target: any, key: PropertyKey): PropertyDescriptor | undefined {
  let source = target

  while (source && source !== objectPrototype) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key)
    if (descriptor)
      return descriptor

    source = Object.getPrototypeOf(source)
  }

  return undefined
}
