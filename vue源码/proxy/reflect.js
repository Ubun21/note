const bucket = new WeakMap
let activeEffect = null
const effectStack = []

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      tracker(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, val) { 
      target[key] = val
      trigger(target, key)
      return true
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
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectToRun.add(effectFn)
    }
  })
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

const obj = { 
  foo: 1,
  get bar() {
    return this.foo
  }
}
const proxyObj = reactive(obj)
effect(() => console.info(proxyObj.bar)) 
proxyObj.foo++ // proxyObj.foo++将不会触发effect。
// proxyObj.bar -》 调用如下函数
// get(target, key) {
//   tracker(target, key)
//   return target[key]
// }
// 此时target就是obj, key就是bar
// ret target[key] -> obj[bar] 这不是通代理对象访问的,自然也就无法进行依赖收集。
// get(target, key, receiver) 第三个参数是代理对象
// 通过Relfect.get(target, key, receiver)的第三个参数把this指向代理对象。