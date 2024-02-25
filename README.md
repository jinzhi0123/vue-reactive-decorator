# vue-reactive-decorator

Provides mobx6-like reactive decorator with OOP style for Vue 2 (composition-api) and Vue 3.

Supports legacy decorator syntax and stage 3 decorators proposal.

## Installation

```bash
npm install vue-reactive-decorator --save
```

## Decorator Versions

1. Legacy Decorator (most existing libs are using this, supported by most tools)

If you are using the legacy decorator syntax(most existing libs are using this), you should add the following configuration to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true // legacy decorator, set to true
  }
}
```

2. Stage 3 Decorator Proposal (2023-05, the future es standard)

If you are using the stage 3 decorator proposal, which was supported by TypeScript 5.0, you should remove the `experimentalDecorators` option or set it to `false` from your `tsconfig.json`:

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
```

You can try to add the flowing configuration to your `tsconfig.json`:

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
import { observable, computed, makeObservable } from 'vue-reactive-decorator';
import { watchSyncEffect } from 'vue'

class Order {
  @observable
  price = 0;

  @observable
  quantity = 0;

  @computed
  get total() {
    return this.price * this.quantity;
  }

  constructor() {
    makeObservable(this);
  }
}

const order = new Order();

const numbers = {
  price: order.price,
  quantity: order.quantity,
  total: order.total,
}

console.log(numbers.total); // 0
console.log(numbers.price); // 0
console.log(numbers.quantity); // 0

watchSyncEffect(() => {
  numbers.price = order.price;
});
watchSyncEffect(() => {
  numbers.quantity = order.quantity;
});
watchSyncEffect(() => {
  numbers.total = order.total;
});

order.price = 10;
console.log(numbers.price); // 10

order.quantity = 2;
console.log(numbers.quantity); // 2

console.log(numbers.total); // 20

```

## Documentation

**Notice**: The documentation is **under construction**, you can refer to the source code for more details.

### `@observable`

Marks a property as observable(ref).

When you call `makeObservable(this)` ,the getter and setter of the property will be replaced with a proxy, and the property will be reactive.

```typescript
import { observable } from 'vue-reactive-decorator';

class Order {
  @observable
  price = 0;

  constructor() {
    makeObservable(this);
  }
}
```

The inner implementation of `@observable` just like the following code:

```typescript
import { ref } from 'vue';

const order = {
  price:0
}

const value = ref(order.price);

Object.defineProperty(order, 'price', {
  get() {
    return value.value;
  },
  set(value) {
    value.value = value;
  }
});
```

### `@computed`

Marks a getter method as a computed property.

The behavior is similar to `computed` in vue.

```typescript
import { computed } from 'vue-reactive-decorator';

class Order {
  @observable
  price = 0;

  @observable
  quantity = 0;

  @computed
  get total() {
    return this.price * this.quantity;
  }

  constructor() {
    makeObservable(this);
  }
}
```

### `@watchEffect`

Marks a method as a watcher.

The behavior is similar to `watchEffect` in vue. When the properties used in the method are changed, the method will be called.

```typescript
import { watchEffect } from 'vue-reactive-decorator';

class Order {
  @observable
  price = 0;

  @observable
  quantity = 0;

  total = 0;

  @watchEffect
  effect() {
    this.total = this.price * this.quantity;
  }

  constructor() {
    makeObservable(this);
  }
}
```

## Thanks

The project is inspired by:
- [mobx](https://mobx.js.org/README.html)
- [vue](https://v3.vuejs.org/)
- [mobv](https://github.com/ivan-94/mobv)
