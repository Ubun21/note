// 对象的属性只能是字符串和Symbol类型,不是的话要转行成字符串
var a = {}, b = '123', c = 123
a[b] = 'b'
a[c] = 'c'
console.info(a[b]) // 输出c
// 对象的索引只能是string和symbol,c是number回转为string,因此会覆盖索引b的值。

var a = {}, b = Symbol('123'), c = Symbol('123')
a[b] = 'b'
a[c] = 'c'
console.info(a[b]) // 输出b
// symbol的值就算相同，也会生成不同的索引。

var a = {}, b = {key: '123'}, c = {key: '456'}
a[b] = 'b'
a[c] = 'c'
console.info(a[b]) // 输出c
// b和c的object,因此会调用Object.prototype.toString方法,都返回的是[object Object]
// 两者都是一样的字符串因此c索引的值会覆盖b索引的值。