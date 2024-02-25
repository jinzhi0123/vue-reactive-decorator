import type { EffectScope } from 'vue-demi'
import { effectScope } from 'vue-demi'
import { addHiddenProp, hasProp } from './utils'

const STORED_EFFECT_SCOPE_KEY = Symbol('VUE_REACTIVE_STORED_EFFECT_SCOPE')

export function getEffectScope(target: any): EffectScope {
  if (hasProp(target, STORED_EFFECT_SCOPE_KEY))
    return target[STORED_EFFECT_SCOPE_KEY]

  const scope = effectScope(true)

  addHiddenProp(target, STORED_EFFECT_SCOPE_KEY, scope)

  return scope
}
