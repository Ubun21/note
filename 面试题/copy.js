function deepCopy(obj) {
  if (typeof obj !== 'object') return
  const newObj = obj instanceof Array ? [] : {}
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      newObj[p] = typeof obj[p] === 'object'? deepCopy(obj[p]) : obj[p]
    }
  }
  return newObj
}

function deepCopy(obj, map = new Map) {
  if (typeof obj !== 'object') {
    return obj
  }

  if (map.get(obj)) {
    return map.get(obj)
  }

  let reuslt = {}

  if (obj instanceof Array || Object.prototype.toString(obj) === '[object, Array]') {
    reuslt = []
  }

  map.set(obj, reuslt)

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      reuslt[key] = deepCopy(obj[key], map)
    }
  }

  return reuslt
}

