// 实现一个retry函数, 成功的话直接返回值,失败的话按照制定的次数进行重试
function fn() {
  const num = Math.random()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (num > 0.7) {
        resolve(num)
      } else {
        reject(num)
      }
    }, 1000)
  })
}

Promise.retry = function(fn, retry) {
  return new Promise(async (resolve, reject) => {
    while (retry--) {
      try {
        const res = await fn()
        console.info('执行成功结果是', res)
        resolve(res)
        break
      } catch (error) {
        console.info('执行失败一次结果是', error)
        if (!retry) {
          reject(error)
        }
      }
    }
  })
}

Promise.retry(fn, 3)