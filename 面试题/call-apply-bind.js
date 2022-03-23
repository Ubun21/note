Function.prototype.myCall = function(context, ...args) {
  context.fn = this  // 例如:f.myCall()的时候this这时候指向的是f这个函数,然后把这个函数加载contentx上
  const result = context.fn(...args) // context.fn执行的时候根据this规则,此时fn函数内的this就指向context
  delete context.fn
  return result
}

Function.prototype.myApply = function(context, args) {
  return this.call(context, ...args)
}

Function.prototype.myBind = function(context, ...args) {
  const f = this
  return function() {
    return f.call(context, [...args, ...arguments])
  }
}

const obj = {a: 1}
const f = function(...args) {
  return {
    context: this,
    args
  }
}

f.bind(obj, 1, 2)(5)

// f.myCall(obj, 1, 2)
f.myApply(obj, [1, 2])

function myNew(context, ...args) {
  const obj = new Object()
  obj.__proto__ = context.prototype
  const res = context.call(obj, ...args)
  return typeof res === 'object'? res : obj
}

Promise.all = function(promises) {
  return new Promise((resolve, reject) => {
    if (typeof promises[Symbol.iterator] !== 'function') {
      throw new Error('promsies must have iterator')
    } else {

      let res = []
      let count = 0
      let len = promises.length
      
      if (len === 0) {
        resolve(res)
      }

      for (let i = 0; i < len; i++) {
        Promise.resolve(promises[i]).then((data) => {
          res[i] = data
          if (++count === len) {
            resolve(res)
          }
        }).catch(error => {
          reject(error)
        })
      }
    }
  })
}