// setTimeout第三个参数。
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.info(i), 1000)
}
// 上面一秒后输出的全部是5
for (var i = 0; i < 5; i++) {
  setTimeout((j) => console.info(j), 1000, i)
}
