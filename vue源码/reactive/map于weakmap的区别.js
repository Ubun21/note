// weakMap是弱引用不影响垃圾回收，一旦没有引用就会被回收。
// weakMap的key必须是object，不能是其他的值，map没有限制。
// weakMap的key不能被枚举，map可以的。
const map = new Map();
const weakMap = new WeakMap();
(function(){
  console.info('test')
  const foo = {a: 1}
  const bar = {b: 2}
  map.set(foo, 2)
  weakMap.set(bar, 3)
})()
console.info(map)
console.info(weakMap)

