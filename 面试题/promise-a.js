const PENDING = 'pending'
const FULFILL = 'fulfill'
const REJECTED = 'rejected'

class MyPromise {
  constructor (exec) {
    this.status = PENDING
    this.value = null
    this.reason = null

    this.onFulFilledCallbacks = []
    this.onRejectedCallbacks = []

    const reslove = (value) => {
      this.status = FULFILL
      this.value = value
      this.onFulFilledCallbacks.forEach(callBack => {
        callBack(this.value)
      })
    }
    const reject = (reason) => {
      this.status = REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach(callBack => {
        callBack(this.reason)
      })
    }

    try {
      exec(reslove, reject)
    } catch (error) {
      reject(error)
    }
  }
  then (onFulFilled, onRejected) {
    const that = this
    let realOnFulFilled = onFulFilled
    if (typeof onFulFilled !== 'function') {
      realOnFulFilled = function (value) {
        return value
      }
    }
    let realOnRejected = onRejected
    if (typeof onRejected !== 'function') {
      realOnRejected = function(reason) {
        return reason
      }
    }
    if (this.status === PENDING) {
      const promise2 = new MyPromise((resolve, reject) => {
        that.onFulFilledCallbacks.push(function() {
          try {
            realOnFulFilled(that.value)
          } catch(error) {
            reject(error)
          }
        })
        that.onRejectedCallbacks.push(function() {
          try {
            realOnRejected(that.reason)
          } catch (error) {
            reject(error)
          }
        })
      })
      return promise2
    }

    if (this.status === FULFILL) {
      const promise2 = new MyPromise((resolve, reject) => {
        try {
          if (typeof onFulFilled !== 'function') {
            resolve(that.value)
          } else {
            const x =  realOnFulFilled(that.value)
            resolve(that.value)
            Promise.resolvePromise(promise2, x, resolve, reject)
          }
        } catch (error) {
          reject(error)
        }
      })
      return promise2
    }

    if (this.status === REJECTED) {
      const promise2 = new MyPromise((resolve, reject) => {
        try {
          if (typeof onRejected !== 'function') {
            reject(that.reason)
          } else {
            realOnRejected(that.reason)
            reject(that.reason)
          }
        } catch (error) {
          reject(error)
        }
      })
      return promise2
    }
  }
}

MyPromise.resolvePromise = function(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'))
  }
  if (x instanceof MyPromise) {

  } else if (typeof x === 'object' || typeof x === 'function') {

  } else {
    resolve(x)
  }
}

console.info('开始promise')
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(200)
  }, 2000)
}).then((fulfill) => {
  console.info('执行成功')
  console.info(fulfill)
}, (reject) => {})
console.info('结束promise')