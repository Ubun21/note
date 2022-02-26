const arr = [1, 2, 3]
const square = num => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(num * num)
    }, 1000)
  })
}


function test() {
  arr.forEach(async (i) => {
    const res = await square(i)
    console.info(res)
  })
}

test()
/**
 * 为什么执行结果将是1秒后输入1, 4, 9 而不是每隔一秒输入一个结果?
 * forEach的原理，循环数组的每一项,每次循环的时候都把callback包装成一个立即执行函数,
 * 把每一项的值作为立即执行函数的参数。
 * 上面的的test函数可以看成下面的样子
 * for (let i = 0; i < arr.length; i++) {
 *   (async index => {
 *      const res = await square(i)
        console.info(res)
 *   })(i)
 * }
 * 相当于设置了3个一秒后执行的定时器,所以一秒之后3个定时器一起执行,立即输出3个结果。
 */

// 方法一 使用正常的for就行跟await就行。
async function test () {
  for (let i = 0; i < arr.length; i++) {
    const res = await square(i)
    console.info(res)
  }
}

// promise 方法
let promise = Promise.resolve()
function test(i) {
  if (i === arr.length) return
  promise = promise.then(async () => {
    const res = await square(i)
    console.info(res)
  })
  test(i + 1)
}
test(0)
