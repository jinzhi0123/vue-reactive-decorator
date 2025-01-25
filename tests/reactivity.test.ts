import { ref } from '@vue/reactivity'
import { watch } from '../src/reactivity'
import { nextTick } from '../src/scheduler'

describe('watchApi', () => {
  it('should run the effect asynchronously when using watch with flush: default(pre)', () => {
    const count = ref(0)
    let dest = 0
    watch(count, (newVal) => {
      dest = newVal
    })
    count.value = 1

    expect(dest).toBe(0)
    nextTick(() => {
      expect(dest).toBe(1)
    })
  })

  it('should run the effect synchronously when using watch with flush: sync', () => {
    const count = ref(0)
    let dest = 0
    watch(count, (newVal) => {
      dest = newVal
    }, { flush: 'sync' })

    count.value = 1

    expect(dest).toBe(1)
  })

  it('should run the effect asynchronously when using watch with flush: post', () => {
    const count = ref(0)
    let dest = 0
    watch(count, (newVal) => {
      dest = newVal
    }, { flush: 'post' })

    count.value = 1

    expect(dest).toBe(0)
    nextTick(() => {
      expect(dest).toBe(1)
    })
  })

  it('should run the effect in the correct order when using watch with flush: post', () => {
    const trigger1 = ref(false)
    const trigger2 = ref(false)

    const dest: string[] = []

    watch(trigger1, () => {
      dest.push('post')
    }, {
      flush: 'post',
    })

    watch(trigger2, () => {
      dest.push('pre')
    })

    trigger1.value = true
    trigger2.value = true
    expect(dest).toEqual([])
    nextTick(() => {
      expect(dest).toEqual(['pre', 'post'])
    })
  })
})
