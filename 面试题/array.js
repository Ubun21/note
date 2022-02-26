const arr1 = new Array(100).fill(0).map((val, idx) => idx + 1)
const arr2 = Array.from(new Array(100), (val, idx) => idx + 1)
const arr3 = [...new Array(100).keys()].map((val, idx) => idx + 1)