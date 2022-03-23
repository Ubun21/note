// 节流在规定的事件内只有第一次触发的函数才能执行。
function throttle(fn, delay) {
  let lastTime = 0
  return function () {
    const now = Date.now()
    if ((now - lastTime) > delay) {
      console.info(now)
      fn.call(this)
    }
    lastTime = now
  }
}

function debounce(fn, delay) {
  let timeId = null
  return function() {
    clearTimeout(timeId)
    timeId = setTimeout(() => {
      fn.call(this)
    }, delay)
  }
}