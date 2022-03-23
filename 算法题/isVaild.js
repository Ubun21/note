function isVaild(str) {
  const map = {
    '{': '}',
    '[': ']',
    '(': ')'
  }
  const stack = []
  for (const s of str) {
    if (s in map) {
      stack.pop(mpa[s])
      continue
    }
    if (map[stack.pop()] !== s) return false
    return stack.length !== 0
  }
}