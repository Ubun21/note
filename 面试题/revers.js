/**
 * 1234逆序输出字符串'4321',只能使用递归
 */

function reverse(num) {
  const str = String(num)
  if (!str) return ''
  return str.slice(-1) + reverse(str.slice(0, str.length - 1))
}
