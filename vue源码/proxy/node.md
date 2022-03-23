#### 什么是代理
代理是指对一个对象的基本语义的代理
#### 基本语义
比如对象obj.a,obj.b++就是基本语义
#### 复合语义
obj.fn()就是复合语义。obj.fn()要执行第一步要通过get操作找到obj.fn的值,然后在调用它。
#### Reflect
Reflect第三个参数，可以改变this指向
```javascript
const obj = { foo: 1}
console.info(Reflect.get(obj, 'foo', {foo: 2})) // 输出的是2
```
#### proxy对象的工作原理
javascript中有两种对象一种是常规对象,一种是异质对象
简单来说proxy创建的对象的就是异质对象

#### 如何完整的拦截一个对象的读取操作
1. obj.foo
  这种最简单只需要设置get函数即可
2. 'foo' in obj
  in操作符其实调用的是[[hasProperty]]这个内部方法，而proxy规定[[hasProperty]]的拦截函数是has
3. for...in
  ownKeys即可

