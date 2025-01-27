globalThis.__DEV__ = true

// runtime polyfill
if (typeof Symbol.metadata === 'undefined') {
  // @ts-expect-error runtime polyfill
  Symbol.metadata = Symbol('Symbol.metadata')
}
