const bucket = new WeakMap
let activeEffect = null
const effectStack = []
const ITERATOR = Symbol()

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      tracker(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, val, receiver) { 
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, val, reactive)
      trigger(target, key, type)
      return res
    },
    has(target, key) {
      tracker(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      tracker(target, ITERATOR)
      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      const hasKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
      if (hasKey && res) {
        trigger(target, key, TriggerType.DELETE)
      }
      return res
    }
  })
}
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(activeEffect)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.deps = []
  effectFn.options = options
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}
function tracker(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)  
}

function trigger(target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectToRun = new Set()

  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectToRun.add(effectFn)
    }
  })

  // 只有当添加属性的时候才执行iteration的effect
  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    const iteartorEffect = depsMap.get(ITERATOR)
    iteartorEffect && iteartorEffect.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectToRun.add(effectFn)
      }
    })
  }

  effectToRun && effectToRun.forEach((fn) => {
    if (fn.options.scheduler) {
      fn.options.scheduler(fn)
    } else {
      fn()
    } 
  })
}
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function computer(getter) {
  let value
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      tracker(obj, 'value')
      return value
    }
  }
  return obj
}

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  const job = ()  => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  let oldValue, newValue
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler: job
    }
  )
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || typeof value === null || seen.has(value)) return
  seen.add(value)
  for (let p in value) {
    traverse(value[p], seen)
  }
  return value
}

const obj = reactive({foo: 1})
effect(() => {
  console.info('子那个姓')
  for (const key in obj) {
    console.info(key)
  }
})
// obj.bar = 2 
// 此时添加bar并不导致effect执行obj.bar = 2
// 会导致trigger(obj, 'bar')而先前的注册的key是ITERATOR,跟bar没有关系。
// 解决的方法是吧ITERATOR的依赖来出来执行一遍。
// 这种方法会导致新的问题
// obj.foo = 3
// 此时我们只是修改属性，并不会影响属性的长度,effect函数按理不应该执行的。

delete obj.foo