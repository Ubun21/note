// curry(add)(1)(2)(3, 4, 5, 6)(8)

function add(...args) {
  return args.reduce((a, b) => {
    return a + b
  }, 0)
}

function curry(fn) {
  const args = []
  return function result(...rest) {
    if (rest.length === 0) {
      return fn(...args)
    } else {
      args.push(...rest)
      return result
    }
  }
}

curry(add)(1)(2, 3)(5)