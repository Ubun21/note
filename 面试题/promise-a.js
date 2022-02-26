const PENDING = 'pending'
const FULFILL = 'fulfill'
const REJECTED = 'rejected'

class Promise {
  constructor (exe) {
    this.status = PENDING
    this.value = null
    this.reason = null

    const reslove = (value) => {}
    const reject = (reason) => {}

    try {
      
    } catch (error) {
      
    }
  }
  then (onFulFilled, onRejected) {}
}

// new MyPromise((resolve, reject) => {
//   const num = Math.random()
//   setTimeout(() => {
//     if (num > 0.5) {
//       resolve(num)
//     } else {
//       reject(num)
//     }
//   }, 2000)
// }).then((fulfill) => {
//   console.info('执行成功')
//   console.info(fulfill)
// }, (reject) => {
//   console.info('执行失败')
//   console.info(reject)
// })