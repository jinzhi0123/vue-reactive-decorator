# vue-reactive-decorator

Provides mobx-like reactive decorator with OOP style for Vue 2 (composition-api) and Vue 3.

Supports legacy decorator syntax and stage 3 decorators proposal.

## Installation

```bash
npm install vue-reactive-decorator --save
```

## Decorator Versions

### Legacy Decorator (most existing libs are using this, supported by most tools)

If you are using the legacy decorator syntax(most existing libs are using this), you should add the following configuration to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true // legacy decorator, set to true
  }
}
```

### Stage 3 Decorator Proposal (2023-05, the future es standard)

If you are using the stage 3 decorator proposal, which was supported by TypeScript 5.0 and latest build tool (version requirements are listed below), you should remove the `experimentalDecorators` option or set it to `false` from your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": false // stage 3 decorator proposal, set to false or remove it
  }
}
```

**Notice**: If your build tool throws an error like:
```bash
[!] (plugin rpt2) RollupError: Unexpected token `@`. Expected identifier, string literal, numeric literal or [ for the computed key (Note that you need plugins to import files that are not JavaScript)

[!] RollupError: src/index.js: Unexpected token `@`. Expected identifier, string literal, numeric literal or [ for the computed key

X [ERROR] Transforming JavaScript decorators to the configured target environment ("es2022") is not supported yet

runtime error: Error: Decorator metadata is not defined.  // if you are using esbuild v0.21.3 to v0.21.4, you may encounter this error
```

Please update your bundle toolchain to the latest version, especially if you are using `stage 3 decorator proposal` or javascript project (compared to typescript project).

- For `rollup`, at least `v4.19.0` is required (if it is a javascript project).
- For `esbuild`, at least `v0.21.5` is required.
- For `vite`, at least `v6.0.0` is required (if you are using stage 3 decorator proposal).
- For `rsbuild`, at least `v1.0.0` is required.

If it still doesn't work, you can try to add the flowing configuration to your `tsconfig.json` **(Note that this is not a good idea. The immediate cause may be that you are using a lower version of build tool.)**:

```json
{
  "compilerOptions": {
    "useDefineForClassFields": false
  }
}
```

## Quick Start

Put the provided reactive decorators on your class properties and call `makeObservable(this)` in the constructor.

**Notice**: The decorators only collect the information of the properties, you need to call `makeObservable(this)` in constructor to make the properties reactive. This is recommended to suit the new decorators proposal.

```typescript
import { watchSyncEffect } from 'vue'
import { computed, makeObservable, observable } from 'vue-reactive-decorator'

class Order {
  @observable
  price = 0

  @observable
  quantity = 0

  @computed
  get total() {
    return this.price * this.quantity
  }

  constructor() {
    makeObservable(this)
  }
}

const order = new Order()

const numbers = {
  price: order.price,
  quantity: order.quantity,
  total: order.total,
}

console.log(numbers.total) // 0
console.log(numbers.price) // 0
console.log(numbers.quantity) // 0

watchSyncEffect(() => {
  numbers.price = order.price
})
watchSyncEffect(() => {
  numbers.quantity = order.quantity
})
watchSyncEffect(() => {
  numbers.total = order.total
})

order.price = 10
console.log(numbers.price) // 10

order.quantity = 2
console.log(numbers.quantity) // 2

console.log(numbers.total) // 20
```

## Documentation

**Notice**: The documentation is **under construction**, you can refer to the source code for more details.

### `@observable`

Marks a property as observable(ref).

When you call `makeObservable(this)` ,the getter and setter of the property will be replaced with a proxy, and the property will be reactive.

```typescript
import { observable } from 'vue-reactive-decorator'

class Order {
  @observable
  price = 0

  constructor() {
    makeObservable(this)
  }
}
```

The inner implementation of `@observable` just like the following code:

```typescript
import { ref } from 'vue'

const order = {
  price: 0
}

const value = ref(order.price)

Object.defineProperty(order, 'price', {
  get() {
    return value.value
  },
  set(value) {
    value.value = value
  }
})
```

### `@observable.ref`

the same as `@observable`.

### `@observable.reactive`

Marks a property as reactive.

When you call `makeObservable(this)` ,the getter and setter of the property will be replaced with reactive proxy, and the property will be reactive.

```typescript
import { observable } from 'vue-reactive-decorator'

class Order {
  @observable.reactive
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

watchSyncEffect(() => {
  items.apple = order.items.apple
})
watchSyncEffect(() => {
  items.orange = order.items.orange
})

order.items.apple++

console.log(items.apple) // 1
```

**Notice**: The same as `reactive` in vue, it will lose reactivity when the marked property is assigned to a new object.

### `@observable.shallowRef`

Marks a property as shallowRef.

When you call `makeObservable(this)` ,the getter and setter of the property will be replaced shallowRef, and the property will be reactive.

The behavior is same as `shallowRef` in vue. Unlike `ref()`, the inner value of a shallow ref is stored and exposed as-is, and will not be made deeply reactive. Only the top-level access is reactive.

```typescript
import { observable } from 'vue-reactive-decorator'

class Order {
  @observable.shallowRef
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

watchSyncEffect(() => {
  items = order.items
})

order.items = { apple: 1, orange: 1 }

console.log(items) // { apple: 1, orange: 1 }
```

### `@observable.shallowReactive`

Marks a property as shallowReactive.

When you call `makeObservable(this)` ,the getter and setter of the property will be replaced shallowReactive, and the property will be reactive.

The behavior is same as `shallowReactive` in vue. Unlike `reactive()`, there is no deep conversion: only root-level properties are reactive for a shallow reactive object. Property values are stored and exposed as-is - this also means properties with ref values will **not** be automatically unwrapped.

```typescript
import { observable } from 'vue-reactive-decorator'

class Order {
  @observable.shallowReactive
  items = {
    apple: 0,
    orange: 0,
    // obj: {
    //   a: 1,
    //   b: 2
    // } // the deep-level properties are not reactive
  }

  constructor() {
    makeObservable(this)
  }
}

const order = new Order()
const items = { ...order.items }

watchSyncEffect(() => {
  items.apple = order.items.apple
})

watchSyncEffect(() => {
  items.orange = order.items.orange
})

order.items.apple++
console.log(items.apple) // 1
```

**Notice**: The same as `shallowReactive` in vue, it will lose reactivity when the marked property is assigned to a new object.

### `@computed`

Marks a getter method as a computed property.

The behavior is similar to `computed` in vue.

```typescript
import { computed } from 'vue-reactive-decorator'

class Order {
  @observable
  price = 0

  @observable
  quantity = 0

  @computed
  get total() {
    return this.price * this.quantity
  }

  constructor() {
    makeObservable(this)
  }
}
```

### `@watchEffect`

Marks a method as a watcher.

The behavior is similar to `watchEffect` in vue. When the properties used in the method are changed, the method will be called.

```typescript
import { nextTick, watchEffect } from 'vue-reactive-decorator'

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

console.log(order.total) // 0

nextTick(() => { // wait for the effect to be called
  console.log(order.total) // 20
})
```

### `@watchSyncEffect`

Marks a method as a synchronous watcher.

The behavior is similar to `watchSyncEffect` in vue. When the properties used in the method are changed, the method will be called.

```typescript
import { watchSyncEffect } from 'vue-reactive-decorator'

class Order {
  @observable
  price = 0

  @observable
  quantity = 0

  total = 0

  @watchSyncEffect
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

console.log(order.total) // 20
```

## Thanks

The project is inspired by:
- [mobx](https://mobx.js.org/README.html)
- [vue](https://v3.vuejs.org/)
- [mobv](https://github.com/ivan-94/mobv)
