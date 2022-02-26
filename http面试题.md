### Cookies sessionStorage localStorage的区别
```javascript
function clone(obj) {
  let tem
  if (typeof obj === 'object' && obj !== null) {
    if (Object.prototype.toString.call(obj).slice(8, -1) === 'Array') {
      tem = new Array
      for (let i = 0; i < obj.length; i++) {
        tem = clone(obj[i])
      }
    } else {
      tem = {}
      for (let p in obj) {
        tem = clone(obj[p])
      }
    }
  } else {
    tem = obj
  }
  return tem
}
```
### 快速排序
```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr
  let priovtIndex = Math.floor(arr.length / 2)
  let priovt = arr.splice(priovtIndex, 1)
  let left = []
  let right = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < priovt) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat(priovt, quickSort(right))
}
```