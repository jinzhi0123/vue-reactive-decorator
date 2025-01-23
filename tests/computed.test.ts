import { watchSyncEffect } from 'vue-demi'
import { Computed, isComputed, makeObservable, Observable } from '../src'

describe('computed decorator', () => {
  it('updates the computed properties', () => {
    class Calculator {
      @Observable
      a = 0

      @Observable
      b = 0

      @Computed
      get result() {
        return this.a + this.b
      }

      constructor() {
        makeObservable(this)
      }
    }

    const calculator = new Calculator()

    let result = calculator.result

    expect(result).toBe(0)

    watchSyncEffect(() => {
      result = calculator.result
    })

    calculator.a++

    expect(result).toBe(1)

    calculator.b = 2

    expect(result).toBe(3)
  })

  it('should throw an error when signature is not a getter', () => {
    class Calculator {
      // @ts-expect-error Unable to resolve signature of property decorator when called as an expression
      @Computed
      a = 0

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => new Calculator()).toThrow('computed can only be used on getter')
  })
})

describe('isComputed', () => {
  class Calculator {
    @Observable
    a = 0

    @Observable
    b = 0

    c = 0

    @Computed
    get result() {
      return this.a + this.b
    }

    constructor() {
      makeObservable(this)
    }
  }

  const calculator = new Calculator()

  it('should return true when the decorator is computed', () => {
    expect(isComputed(Computed)).toBe(true)
  })

  it('should return false when the decorator is not computed', () => {
    expect(isComputed(Observable)).toBe(false)
  })

  it('should return true when the key in the object is observable', () => {
    expect(isComputed(calculator, 'result')).toBe(true)
  })

  it('should return false when the key in the object is not observable', () => {
    expect(isComputed(calculator, 'a')).toBe(false)
    expect(isComputed(calculator, 'c')).toBe(false)
  })
})
