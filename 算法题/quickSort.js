function quickSort(arr) {
  if (arr.length <= 1) return arr
  const index = Math.floor(arr.length / 2)
  const valu = arr.splice(index , 1)
  const left = []
  const right = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < valu) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat(valu, quickSort(right))
}

const resu = quickSort([3, 1, 9, 333, 111, 4444, 22])
console.info(resu)