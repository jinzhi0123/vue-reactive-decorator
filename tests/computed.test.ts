import { watchSyncEffect } from 'vue-demi'
import { computed, makeObservable, observable } from '../src'

describe('computed decorator', () => {
  it('updates the computed properties', () => {
    class Calculator {
      @observable
      a = 0

      @observable
      b = 0

      @computed
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
      @computed
      a = 0

      constructor() {
        makeObservable(this)
      }
    }

    expect(() => new Calculator()).toThrow('computed can only be used on getter')
  })
})
