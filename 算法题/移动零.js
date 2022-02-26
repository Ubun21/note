// 把数组的零移动到数组的末尾，非零保持顺序
/**
 * [0, 1, 0, 3, 12]
 * [1, 3, 12, 0, 0]
 */

// 思路用快慢指针
function moveZero(arr) {
  let slow = arr.length - 1
  let fast = arr.length - 1
  while (fast >= 0) {
    if (arr[fast] !== 0) {
      fast--
    } else {
      let moveCurr = fast
      let movePre = moveCurr + 1
      while (movePre <= slow) {
        arr[moveCurr] = arr[movePre]
        moveCurr++
        movePre++
      }
      fast--
      slow--
    }
  }
  while (++slow <= (arr.length - 1)) {
    arr[slow] = 0
  }
  return arr
}

// 方法二
function mvoeZero1(arr) {
  let j = 0
  for (let i = 0; i < arr.length - j; i++) {
    if (arr[i] === 0) {
      arr.splice(i, 1)
      arr.push(0)
      j++
      i--
    }
  }
  return arr
}

// 方法三
function moveZero2(arr) {
  let index = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) {
      index++
    } else if (index !== 0) {
      arr[i - index] = arr[i]
      arr[i] = 0
    }
  }
  return arr
}

const arr = moveZero2([0, 0, 0, 3, 12])
console.info(arr)