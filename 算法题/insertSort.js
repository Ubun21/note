function insertSort(arr) {
  const sortedArr = []
  sortedArr[0] = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (sortedArr.peek() < arr[i]) {
      sortedArr.push(arr[i])
    } else {
      for (let j = sortedArr.length - 2; j >= -1; j--) {
        if (sortedArr[j] < arr[i]) {
          sortedArr.splice(j + 1, 0, arr[i])
          break
        } else if (j === -1) {
          sortedArr.splice(0, 0, arr[i])
        }
      }
    }
  }
  return sortedArr
}

Array.prototype.peek = function() {
  return this[this.length - 1]
}

const arr = insertSort([3, 1, 9, 333, 111, 4444, 22])
console.info(arr)