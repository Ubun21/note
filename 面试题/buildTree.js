function buildTree(str) {
  str = str.split(/[\[\]]/g).filter(v => v)
  var obj = {}
  var curr = obj
  while (str.length) {
    const item = str.shift()
    curr['value'] = item
    if (str.length) {
      curr['children'] = {}
      curr = curr['children']
    }
  }
  return obj
}