import { isReactive, watchSyncEffect } from 'vue-demi'
import { makeObservable, observable } from '../src'

describe('observable decorator', () => {
  globalThis.__DEV__ = true
  it('updates the observable properties', () => {
    class Calculator {
      @observable
    a = 0

      @observable
    b = 0

      @observable
    result = 0

      addA() {
        this.a++
      }

      addB() {
        this.b++
      }

      calculate() {
        this.result = this.a + this.b
      }

      constructor() {
        makeObservable(this)
      }
    }

    const calculator = new Calculator()

    const numbers = {
      a: 0,
      b: 0,
      result: 0,
    }

    expect(calculator.a).toBe(0)
    expect(calculator.b).toBe(0)
    expect(calculator.result).toBe(0)

    watchSyncEffect(() => {
      numbers.a = calculator.a
    })
    watchSyncEffect(() => {
      numbers.b = calculator.b
    })
    watchSyncEffect(() => {
      numbers.result = calculator.result
    })

    calculator.addA()
    calculator.addB()
    calculator.calculate()

    expect(numbers.a).toBe(1)
    expect(numbers.b).toBe(1)
    expect(numbers.result).toBe(2)
  })

  it('updates the observable object properties', () => {
    class Order {
      @observable
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = {
      apple: order.items.apple,
      orange: order.items.orange,
    }
    expect(order.items.apple).toBe(0)
    expect(order.items.orange).toBe(0)
    expect(items.apple).toBe(0)

    watchSyncEffect(() => {
      items.apple = order.items.apple
    })
    watchSyncEffect(() => {
      items.orange = order.items.orange
    })

    order.items.apple++
    order.items.orange++

    expect(isReactive(order.items)).toBe(true)
    expect(items.apple).toBe(1)
    expect(items.orange).toBe(1)
  })

  it('updates the observable array properties', () => {
    class Order {
      @observable
      items: string[] = []

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()

    let items = [...order.items]
    expect(items.length).toBe(0)

    watchSyncEffect(() => {
      items = [...order.items]
    })

    order.items.push('apple')

    expect(isReactive(order.items)).toBe(true)
    expect(items.length).toBe(1)
  })

  it('should throw an error when signature is not a property', () => {
    class Order {
      // @ts-expect-error unable to resolve signature of method decorator when called as an expression.
      @observable
      print() {
        console.log('print')
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
