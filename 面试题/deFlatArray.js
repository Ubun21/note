let flatArr = [
  {id: 1, title: '标题1', parent_id: 0},
  {id: 2, title: '标题2', parent_id: 0},
  {id: 3, title: '标题2-1', parent_id: 2},
  {id: 4, title: '标题3-1', parent_id: 3},
  {id: 5, title: '标题4-1', parent_id: 4},
  {id: 6, title: '标题2-2', parent_id: 2},
]

function enFlatArr(list) {
  const tree = []
  const map = list.reduce((pre, curr) => {
    pre[curr.id] = curr
    return pre
  }, {})
  for (let item of list) {
    if (item.parent_id === 0) {
      tree.push(item)
      continue
    }
    if (map[item.parent_id]) {
      const parent = map[item.parent_id]
      parent.children = parent.children || []
      parent.children.push(item)
    }
  }
  return tree
}

function deFlatArr(arr) {
  const result = []
  const trave = (arr) => {
    for (let p of arr) {
      result.push({
        id: p.id,
        title: p.title,
        parent_id: p.parent_id
      })
      if (p.children && Array.isArray(p.children)) {
        trave(p.children)
      }
    }
  }
  trave(arr)
  return result
}

const tree = enFlatArr(flatArr)
const flatTree = deFlatArr(tree)
console.info(flatTree)