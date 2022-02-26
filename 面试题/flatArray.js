var arr = [
  [1, 2, 3],
  [3, 4, 5, 6],
  [7, 8, 11, 22, 
   [22, 33], [111], [1, [99]]
  ]
]

Array.prototype.flat = function() {
  const result = this.map(item => {
    if (Array.isArray(item)) {
      return item.flat()
    } else {
      return [item]
    }
  })
  return [].concat(...result)
}

Array.prototype.unique = function() {
  return [...new Set(this)]
}

const sortFn = (a, b) => a - b

arr.flat().unique().sort(sortFn)