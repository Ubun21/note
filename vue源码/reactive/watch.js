const bucket = new WeakMap
let activeEffect = null
const effectStack = []

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      tracker(target, key)
      return target[key]
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
    console.info('effectFn执行了。')
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
// const proxyObj = reactive({foo: 1, bar: 2})
// const effectFn = effect(
//   () => {
//     console.info('lazy') // 不会立即执行
//     return proxyObj.foo + proxyObj.bar
//   },
//   { lazy: true }
// )

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

const proxyObj = reactive({foo: 1})

function watch(source, cb) {
  effect(
    () => traverse(source),
    {
      scheduler() {
        cb()
      }
    }
  )
}

function traverse(value, seen = new Set()) {
  debugger
  if (typeof value !== 'object' || typeof value === null || seen.has(value)) return
  seen.add(value)
  for (let p in value) {
    traverse(value[p], seen)
  }
  return value
}

watch(proxyObj, () => console.info('数据变化了'))
proxyObj.foo = 2