const bucket = new WeakMap
let activeEffect = null
const effectStack = []
const ITERATOR = Symbol()
const ITERATOR_KEY = Symbol()

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
}

const reactiveMap = new Map
function reactive(obj) {
  const exitingReactive = reactiveMap.get(obj)
  if (exitingReactive) {
    return exitingReactive
  }

  const proxy = createReactive(obj)
  reactiveMap.set(obj, proxy)
  return proxy
}

const mutationsInstructiom = {
  get(key) {
    const origin = this.__raw__
    const has = origin.has(key)
    tracker(origin, key)
    if (has) {
      const res = origin.get(key)
      return (typeof res === 'object' && res !== null) ? reactive(res) : res
    }
  },
  add(key) {
    const origin = this.__raw__
    
    const hasKey = origin.has(key)
    if (!hasKey) {
      const res = origin.add(key)
      trigger(origin, key, 'ADD')
      return res
    }
  },
  delete(key) {
    const origin = this.__raw__
    const hasKey = origin.has(key)
    if (hasKey) {
      const res = origin.delete(key)
      trigger(origin, key, 'DELETE')
      return res
    }
  },
  set(key, value) {
    const origin = this.__raw__
    const had = origin.has(key)
    const oldValue = origin.get(key)
    const rawValue = value.__raw__ || value
    origin.set(key, rawValue)
    if (!had) {
      trigger(origin, key, 'ADD')
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      trigger(origin, key, 'SET')
    }
  },
  forEach(callback, thisArgs) {
    const origin = this.__raw__
    const wrap = (val) => (typeof val === 'object' && val !== null)? reactive(val) : val
    tracker(origin, ITERATOR_KEY)
    // 通过origin遍历，把origin的值传递给callback，此时origin的值不是响应对象。
    // origin.forEach(callback)
    origin.forEach((v, k) => {
      callback.call(thisArgs, wrap(v), wrap(k), this)
    })
  }
}

function createReactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === '__raw__') return target
      if (key === 'size') {
        tracker(target, ITERATOR_KEY)
        return Reflect.get(target, key, target)
      }

      return mutationsInstructiom[key]
    }
  })
}

function shadowReactive(obj) {
  return createReactive(obj, true)
}

function readOnly(obj) {
  return createReactive(obj, false, true)
}

const originMethod = Array.prototype.includes
const arrayInstruments = {
}

;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  arrayInstruments[method] = function (...args) {
    const originMethod = Array.prototype[method]
    let res = originMethod.apply(this, args)

    if (res === false) {
      res = originMethod.apply(this.__raw__, args)
    }
    return res
  }
})

let shouldTrack = true
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  arrayInstruments[method] = function (...args) {
    const originMethod = Array.prototype[method]
    shouldTrack = false
    originMethod.apply(this, args)
    shouldTrack = true
  }
})

function createReactiveBaseHandle(obj, isShadow = false, isReadOnly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === '__raw__') {
        return target
      }

      if (Array.isArray(target) && arrayInstruments.hasOwnProperty(key)) {
        return Reflect.get(arrayInstruments, key, receiver)
      }

      const res = Reflect.get(target, key, receiver)

      if (!isReadOnly && typeof key !== 'symbol') {
        tracker(target, key)
      }

      if (isShadow) {
        return res
      }

      if (typeof res === 'object' && res !== null) {
        return isReadOnly? readOnly(res) : reactive(res)
      }

      return res
    },
    set(target, key, newVal, receiver) { 

      if (isReadOnly) {
        console.warn(`属性${key}为只读!`)
        return true
      }

      const oldValue = target[key]
      const type = Array.isArray(target)
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)

      if (receiver.__raw__ === target) {
        if (oldValue !== newVal &&(oldValue === oldValue || newVal === newVal)) {
          trigger(target, key, type, newVal)
        }
      }

      return res
    },
    has(target, key) {
      tracker(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      tracker(target, Array.isArray(target) ? 'length' : ITERATOR)
      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      if (isReadOnly) {
        console.warn(`属性${key}为只读!`)
        return true
      }

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
  if (!activeEffect || !shouldTrack) return
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

function trigger(target, key, type, newVal) {
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

  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffect = depsMap.get('length')
    lengthEffect && lengthEffect.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect)
      }
    })
  }

  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectToRun.add(effectFn)
          }
        })
      }
    })
  }

  if (type === TriggerType.ADD || TriggerType.DELETE) {
    const iteartorEffects = depsMap.get(ITERATOR_KEY)
    iteartorEffects && iteartorEffects.forEach((effectFn) => {
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

// const p = reactive(new Map([
//   [{key: 1}, {value: 1}]
// ]))
// effect(() => {
//   p.forEach((value, key, m) => {
//     console.info('value', value)
//     console.info('key', key)
//   })
// })
// 实现的方式是，通过拦截forEach方法获取原对象
// 在原对象上调用foreach,把callback传递给
// 存在的问题

// const key = { key: 1}
// const value = new Set([1, 2, 3])
// const p = reactive(new Map([
//   [key, value]
// ]))
// effect(() => {
//   p.forEach((value, key) => {
//     console.info(value.size)  // 此时输出3
//   })
// })

// const tem = p.get(key)
// tem.delete(1)

const p = reactive(new Map([
  ['key', 1]
]))

effect(() => {
  p.forEach(function(value, key) {
    console.info(value)
  })
})

p.set('key', 2) // 应该要执行effect