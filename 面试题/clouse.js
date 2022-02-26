function foo(a, b) {
  console.info(b)
  return {
    foo: function(c) {
      return foo(c, a)
    }
  }
}

var x = foo(0);
x.foo(1)
x.foo(2)
x.foo(3)