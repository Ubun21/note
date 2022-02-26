const lengthOfLGH = function (nums) {
  const len = nums.length
  if (len <= 1) return len
  const arr = new Array
  arr[0] = nums[0]
  for (let i = 0; i < len; i++) {
    if (arr[arr.length - 1] < nums[i]) {
      arr.push(nums[i])
    } else {
      let left = 0
      let right = arr.length - 1
      while (left < right) {
        let mid = (left + right) >> 1
        if (arr[mid] < nums[i]) {
          left = mid + 1
        } else {
          right = mid
        }
      }
      arr[left] = nums[i]
    }
  }
  return arr
}

function getSequence(arr) {
  let p = arr.slice()
  let len = arr.length
  let j, u, v
  let result = [0]
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI != 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i) 
        continue
      } else {
        u = 0
        v = result.length - 1
        while (u < v) {
          const mid = (u + v) >> 1
          if (arr[result[mid]] < arrI) {
            u = mid + 1
          } else {
            v = mid
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
console.log(getSequence([10, 9, 2, 5, 3, 7, 101, 18, 1]))