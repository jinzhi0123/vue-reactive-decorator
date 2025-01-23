import { nextTick } from 'node:process'
import { isWatchEffect, makeObservable, Observable, WatchEffect, WatchSyncEffect } from '../src'

describe('watchEffect decorator', () => {
  it('trigger the effect method nextTick when the observable properties change', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 0

      total = 0

      @WatchEffect
      effect() {
        this.total = this.price * this.quantity
      }

      constructor() {
        makeObservable(this)
      }
    }

    const order = new Order()
    order.price = 10
    order.quantity = 2

    nextTick(() => {
      expect(order.total).toBe(20)
    })
  })

  it('does not trigger right away till nickTick', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 0

      total = 0

      @WatchEffect
      effect() {
        this.total = this.price * this.quantity
      }

      constructor() {
        makeObservable(this)
      }
    }

    const order = new Order()
    order.price = 10
    order.quantity = 2

    expect(order.total).toBe(0)
  })

  it('should throw an error when signature is not a method', () => {
    class Order {
      // @ts-expect-error Unable to resolve signature of method decorator when called as an expression
      @WatchEffect
      price = 0

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => new Order()).toThrow('@watchEffect can only be used with methods.')
  })
})

describe('watchSyncEffect decorator', () => {
  it('trigger the effect method right away when the observable properties change', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 0

      total = 0

      @WatchSyncEffect
      effect() {
        this.total = this.price * this.quantity
      }

      constructor() {
        makeObservable(this)
      }
    }

    const order = new Order()
    order.price = 10
    order.quantity = 2

    expect(order.total).toBe(20)
  })

  it('should throw an error when signature is not a method', () => {
    class Order {
      // @ts-expect-error Unable to resolve signature of method decorator when called as an expression
      @WatchSyncEffect
      price = 0

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => new Order()).toThrow('@watchEffect can only be used with methods.')
  })
})

describe('isWatchEffect', () => {
  class Order {
    @Observable
    price = 0

    @Observable
    quantity = 0

    total = 0

    @WatchEffect
    effect() {
      this.total = this.price * this.quantity
    }

    constructor() {
      makeObservable(this)
    }
  }

  const order = new Order()

  it('should return true when the decorator is watchEffect', () => {
    expect(isWatchEffect(WatchEffect)).toBe(true)
    expect(isWatchEffect(WatchSyncEffect)).toBe(true)
  })

  it('should return false when the decorator is not watchEffect', () => {
    expect(isWatchEffect(Observable)).toBe(false)
  })

  it('should return true when the key in the object is watchEffect', () => {
    expect(isWatchEffect(order, 'effect')).toBe(true)
  })

  it('should return false when the key in the object is not watchEffect', () => {
    expect(isWatchEffect(order, 'quantity')).toBe(false)
    expect(isWatchEffect(order, 'total')).toBe(false)
  })
})
