import { makeObservable, Observable, Watch } from '../src'
import { nextTick } from '../src/scheduler'

describe('watch decorator', () => {
  it('should trigger the effect method when the observable properties change with the source of a getter', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 0

      total = 0

      @Watch(function () { return this.price * this.quantity })
      effect(value: number) {
        this.total = value
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

  it('should trigger the effect method when the observable properties change with the source of observable key', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 2

      total = 0

      str = 'price'

      @Watch('price')
      effect(value: number) {
        this.total = value * this.quantity
      }

      constructor() {
        makeObservable(this)
      }
    }

    const order = new Order()
    order.price = 10

    nextTick(() => {
      expect(order.total).toBe(20)
    })
  })

  it('should throw an error when the source is not observable', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 0

      total = 0

      @Watch('total')
      effect(value: number) {
        this.total = value
      }

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => {
      const _order = new Order()
    }).toThrow()
  })
})

describe('watch decorator with options', () => {
  it('should trigger the effect method once when once is true', () => {
    class Order {
      @Observable
      price = 0

      @Observable
      quantity = 1

      total = 0

      @Watch('price', { once: true })
      effect(value: number) {
        this.total = value
      }

      constructor() {
        makeObservable(this)
      }
    }

    const order = new Order()
    order.price = 10

    nextTick(() => {
      expect(order.total).toBe(10)
      order.price = 20
    }).then(() => {
      expect(order.total).toBe(10)
    })
  })
})
