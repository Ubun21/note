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
        console.warn(`??????${key}?????????!`)
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
        console.warn(`??????${key}?????????!`)
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

  // ???????????????????????????????????????iteration???effect
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

// const s = new Set([1, 2, 3])
// const p = new Proxy(s, {})
// console.info(p.size)
// Set.prototype.size ????????????????????????,????????????????????????[[setData]]????????????
// ??????????????????p??????size????????????this??????????????????????????????????????????????????????[[setData]]

// const s = new Set([1, 2, 3])
// const p = new Proxy(s, {
//   get(target, key, receiver) {
//     if (key === 'size') {
//       return Reflect.get(target, key, target)
//     } else {
//       return Reflect.get(target, get, receiver)
//     }
//   }
// })
// console.info(p.size)

// const s = new Set([1, 2, 3])
// const p = reactive(s)
// console.info(p.size)
// p.delete(1)
// // p.delete??????p.size????????????????????????????????????Reflect.get???????????????this?????????
// // p.delete()???????????????this????????????????????????
// console.info(p.size)

const p = reactive(new Set([1, 2, 3]))
effect(() => console.info(p.size))
p.add(4)
p.delete(1)