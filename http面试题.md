### Cookies sessionStorage localStorage的区别
```javascript
function clone(obj) {
  let tem
  if (typeof obj === 'object' && obj !== null) {
    if (Object.prototype.toString.call(obj).slice(8, -1) === 'Array') {
      tem = new Array
      for (let i = 0; i < obj.length; i++) {
        tem = clone(obj[i])
      }
    } else {
      tem = {}
      for (let p in obj) {
        tem = clone(obj[p])
      }
    }
  } else {
    tem = obj
  }
  return tem
}
```
### 快速排序
```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr
  let priovtIndex = Math.floor(arr.length / 2)
  let priovt = arr.splice(priovtIndex, 1)
  let left = []
  let right = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < priovt) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat(priovt, quickSort(right))
}
```

import store '@/store/index.js'
	export default {
		name: 'Index',
		data() {
			return {
				date: getDateStr('MM-YYYY'),
				monthsTitleStyle : {
					"fontSize": "16px",
					"background": "#ffda47"
				},
				yearsTitelStyle: {
					"background": "#ffda47"
				}
			}
		},
		computed: {
			allBills: function () {
				return store.getters.allBills.filter(item => {
					return getDateStr('MM-YYYY', item.date) === this.date
				})
			},
			allInComeByDate: function () {
				return this.getInOrOutCome('+')
			},
			allOutComeByDate: function () {
				return this.getInOrOutCome('-')
			},
			bills = function () {
				return this.allBills.reduce((acc, curr) => {
					const date = getDateStr('YYYY-M-D', curr.date)
					if (!acc.hasOwnProperty(date)) {
						acc[date] = {
							list: [],
							'total': 0
						}
					}
					acc[date].list.push(curr)
					curr.type === '+' ? (acc[date].total += curr.amount) : 
						(acc[date].total -= curr.amount)
					return acc
				}, {})
			}
		},
		methods: {
			getInOrOutCome: function (inOrOut) {
				return this.allBills.filter(item => {
					return item.type === inOrOut && (getDateStr('MM-YYYY', item.date) === this.date)
				}).reduce((acc, curr) => {
					return acc + curr.amount
				}, 0)
			},
			yearSelectHandle: function (newDate) {
				const dateStr = this.date.split('-')
				this.date = dateStr[0] + '-' + newDate	
			},
			monthSelectHandle: function (newDate) {
				const dateStr = this.date.split('-')
				this.date = newDate + '-' + dateStr[1]
			},
		}
	}