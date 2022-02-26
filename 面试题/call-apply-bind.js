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