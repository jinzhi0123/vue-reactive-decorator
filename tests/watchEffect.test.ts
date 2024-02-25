import { nextTick } from 'node:process'
import { makeObservable, observable, watchEffect } from '../src'

describe('watchEffect decorator', () => {
  it('trigger the effect method when the observable properties change', () => {
    class Order {
      @observable
      price = 0

      @observable
      quantity = 0

      total = 0

      @watchEffect
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

  it('should throw an error when signature is not a method', () => {
    class Order {
      // @ts-expect-error Unable to resolve signature of method decorator when called as an expression
      @watchEffect
      price = 0

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => new Order()).toThrow('@watchEffect can only be used with methods.')
  })
})
