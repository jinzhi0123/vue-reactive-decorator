import { nextTick } from 'vue-demi'
import { makeObservable, observable, watch } from '../src'

describe('watch decorator', () => {
  it('should trigger the effect method when the observable properties change with the source of a getter', () => {
    class Order {
      @observable
      price = 0

      @observable
      quantity = 0

      total = 0

      @watch<Order>(function () { return this.price * this.quantity })
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
      @observable
      price = 0

      @observable
      quantity = 2

      total = 0

      @watch<Order>('price')
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
      @observable
      price = 0

      @observable
      quantity = 0

      total = 0

      @watch<Order>('total')
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
