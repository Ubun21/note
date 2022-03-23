console.info(typeof 1) // number
console.info(typeof true) // boolean
console.info(typeof 's') // string
console.info(typeof []) // object
console.info(typeof {}) // object
console.info(typeof function(){}) // function
console.info(typeof Symbol) // function
console.info(typeof null) // object
console.info(typeof undefined) // undefined

console.info(1 instanceof Number) // false
console.info(true instanceof Boolean) // false
console.info('' instanceof String) // false
console.info([] instanceof Array) // true
console.info({} instanceof Object) // true
console.info(function() {} instanceof Function) // true

const toString = Object.prototype.toString
console.info(toString.call(1)) // [object Number]
console.info(toString.call('')) // [object String]
console.info(toString.call(true)) // [object Boolean]
console.info(toString.call([])) // [object Array]
console.info(toString.call({})) // [object Object]
console.info(toString.call(null)) // [object Null]
console.info(toString.call(undefined)) // [object Undefined]
console.info(toString.call(Symbol)) // [object Function]
console.info(toString.call(new Map)) // [object Map]
console.info(toString.call(new Set)) // [object Set]