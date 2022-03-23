#### HTML Attributes于Dom Properties
attributes是指写在html标签中的属性,properties是通过dom api拿到元素后通过.操作访问的属性。
一般properties都有attributes想对应
```html
<input id="my-input" type="text" value="foo"/>
<script>
const myId = document.getElementById('my-input')
console.info(myId.id)
console.info(myId.type)
console.info(myId.value)
</script>
```
一般情况下他们的值是相对应的，但是也是有特殊情况的.
attirbute的作用是设置properties的初始值
#### setAttribute的一些问题
1. 调用setAttribute('disable', false)会转化为setAttribute('disable', 'false')导致无法按钮被禁用。
2. 使用dom properties的时候注意模板空字符串的问题。例如有一个下面的模板。
```javascript
const button =  {
  type: 'button',
  props: {
    disabled: ''
  }
}
```
如果直接调用domapi通过property设置属性的话el.disabled=''浏览器会自动的吧空字符转为el.disabled=false。
3. 有些dom-property是只读的不能设置,只能使用setAtrribute来设置。
#### innerHTML
innerHTML并不会清除已经添加的事件监听器