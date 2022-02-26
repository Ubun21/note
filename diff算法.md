### patchKeyChildren的核心执行流程
```javascript
const patchKeyedChildren = () => {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1 // prev ending index
    let e2 = l2 - 1 // next ending index

    // 1. 进行头部遍历，遇到相同节点则继续，不同节点则跳出循环
    while (i <= e1 && i <= e2) {}

    // 2. 进行尾部遍历，遇到相同节点则继续，不同节点则跳出循环
    while (i <= e1 && i <= e2) {}

    // 3. 如果旧节点已遍历完毕，并且新节点还有剩余，则遍历剩下的进行新增
    if (i > e1) {
      if (i <= e2) {}
    }

    // 4. 如果新节点已遍历完毕，并且旧节点还有剩余，则直接卸载
    else if (i > e2) {
      while (i <= e1) {}
    }

    // 5. 新旧节点都存在未遍历完的情况
    else {
      // 5.1 创建一个map，为剩余的新节点存储键值对，映射关系：key => index
      // 5.2 遍历剩下的旧节点，新旧数据对比，移除不使用的旧节点
      // 5.3 拿到最长递增子序列进行move or 新增挂载
    }
  }
```