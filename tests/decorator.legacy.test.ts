import { is2023Decorator } from '../src/decorator'
import { Observable } from '../src/observable'

describe(('is2023Decorator api'), () => {
  it('should throw error if no decorator is applied before calling', () => {
    expect(() => is2023Decorator()).toThrow()
  })
  it('should return true after any decorator is applied', () => {
    class _Counter {
      @Observable
      count = 0
    }

    expect(is2023Decorator()).toBe(false)
  })
})
