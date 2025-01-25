import { isReactive } from '@vue/reactivity'
import { Computed, isObservable, makeObservable, Observable } from '../src'
import { watchSyncEffect } from '../src/reactivity'

describe('observable decorator', () => {
  it('updates the observable properties', () => {
    class Calculator {
      @Observable
      a = 0

      @Observable
      b = 0

      @Observable
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
      @Observable
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
      @Observable
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
      @Observable
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

describe('observable.shallowRef decorator', () => {
  it('updates when the property object self changes (.value access is reactive)', () => {
    class Order {
      @Observable.shallowRef
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    let items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items = order.items
    })

    order.items = { apple: 1, orange: 1 }

    expect(isReactive(order.items)).toBe(false)
    expect(items).toEqual(order.items)
  })

  it('does not update when the properties of the marked property change (the inner level of the .value access is not reactive)', () => {
    class Order {
      @Observable.shallowRef
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items.apple = order.items.apple
    })
    watchSyncEffect(() => {
      items.orange = order.items.orange
    })

    order.items.apple++

    expect(isReactive(order.items)).toBe(false)
    expect(items).toEqual({
      apple: 0,
      orange: 0,
    })
  })
})

describe('observable.reactive decorator', () => {
  it('updates when the root-level properties change (the root-level properties are reactive) ', () => {
    class Order {
      @Observable.reactive
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items.apple = order.items.apple
    })
    watchSyncEffect(() => {
      items.orange = order.items.orange
    })

    order.items.apple++

    expect(isReactive(order.items)).toBe(true)
    expect(items).toEqual({
      apple: 1,
      orange: 0,
    })
  })

  it('updates when the inner-level properties change (the inner-level are reactive)', () => {
    class Order {
      @Observable.reactive
      items = {
        fruits: {
          apple: 0,
          orange: 0,
        },
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items.fruits.apple = order.items.fruits.apple
    })
    watchSyncEffect(() => {
      items.fruits.orange = order.items.fruits.orange
    })

    order.items.fruits.apple++

    expect(isReactive(order.items)).toBe(true)
    expect(items).toEqual({
      fruits: {
        apple: 1,
        orange: 0,
      },
    })
  })

  it('lose reactivity when the marked property is assigned to a new object', () => {
    class Order {
      @Observable.reactive
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    let items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items = order.items
    })

    order.items = { apple: 1, orange: 1 }
    // the proxy is replaced, so the items is not updated
    expect(isReactive(order.items)).toBe(false)
    expect(items).toEqual({
      apple: 0,
      orange: 0,
    })
  })
})

describe('observable.shallowReactive decorator', () => {
  it('updates when the root-level properties change (the root-level properties are reactive) ', () => {
    class Order {
      @Observable.shallowReactive
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items.apple = order.items.apple
    })
    watchSyncEffect(() => {
      items.orange = order.items.orange
    })

    order.items.apple++

    expect(isReactive(order.items)).toBe(true)
    expect(items).toEqual({
      apple: 1,
      orange: 0,
    })
  })

  it('does not update when the inner-level properties change (the inner-level are not reactive)', () => {
    class Order {
      @Observable.shallowReactive
      items = {
        fruits: {
          apple: 0,
          orange: 0,
        },
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    const items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items.fruits.apple = order.items.fruits.apple
    })
    watchSyncEffect(() => {
      items.fruits.orange = order.items.fruits.orange
    })

    expect(isReactive(order.items)).toBe(true)
    expect(items).toEqual({
      fruits: {
        apple: 0,
        orange: 0,
      },
    })
  })

  it('lose reactive when the marked property is assigned to a new object', () => {
    class Order {
      @Observable.shallowReactive
      items = {
        apple: 0,
        orange: 0,
      }

      constructor() {
        makeObservable(this)
      }
    }
    const order = new Order()
    let items = { ...order.items }
    expect(items).toEqual(order.items)

    watchSyncEffect(() => {
      items = order.items
    })

    order.items = { apple: 1, orange: 1 }
    // the proxy is replaced, so the items is not updated
    expect(isReactive(order.items)).toBe(false)
    expect(items).toEqual({
      apple: 0,
      orange: 0,
    })
  })
})

describe('isObservable', () => {
  class Order {
    @Observable
    price = 0

    quantity = 0

    @Computed
    get total() {
      return this.price * this.quantity
    }

    constructor() {
      makeObservable(this)
    }
  }

  const order = new Order()

  it('should return true when the decorator is observable', () => {
    expect(isObservable(Observable)).toBe(true)
  })

  it('should return false when the decorator is not observable', () => {
    expect(isObservable(Computed)).toBe(false)
  })

  it('should return true when the key in the object is observable', () => {
    expect(isObservable(order, 'price')).toBe(true)
  })

  it('should return false when the key in the object is not observable', () => {
    expect(isObservable(order, 'quantity')).toBe(false)
    expect(isObservable(order, 'total')).toBe(false)
  })
})
