// runtime polyfill
if (typeof Symbol.metadata === 'undefined') {
  // @ts-expect-error runtime polyfill
  Symbol.metadata = Symbol('Symbol.metadata')
}

export * from './adm'
export * from './computed'
export * from './decorator'
export * from './makeObservable'
export * from './observable'
export * from './override'
export * from './store'
export * from './store-native'
export * from './store-prototype'
export * from './utils'
export * from './watch'
export * from './watchEffect'
