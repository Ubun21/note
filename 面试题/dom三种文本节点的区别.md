#### innerText, nodeValue, textContent三者的区别。
```html
<div id="app">
  水果
  <!-- 注释-->
  <p>
    西瓜
    <style>
      red {
        background-color: red;
      }
    </style>
    <div style={ display: none;}>
      瓜子
    </div>
  </p>
</div>
<script>
  const app = document.getElementById('app')
  console.info(app.children[0].nodeValue)
</script>
```

nodeValue只能取文本节点的值,innerText输出子元素所有的文本节点,textContent把所有的子元素都当做文本节点输出不管是不是文本。