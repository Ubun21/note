var _name = 'global'
var obj = {
   func: function () {
    const innerFunc = () => {
      console.info(this._name)
    }
    return innerFunc
  },
  _name: 'local'
}

obj.func()() // 箭头函数是this作用域是创建的时候制定的,
var func = obj.func;
func()(); // this = window
obj.func.bind({ _name: 'newObj'})()(); // this = {_name: 'newObj'}
obj.func.bind()()(); // bind() 值null或者undefined绑定无效
obj.func.bind({_name: 'bindValue'}).apply({_name: 'applyValue'})()() // bind 绑定后apply和call无法在更改