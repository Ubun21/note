function effect(arr) {
  arr[0] = arr[2]
}

function fn(a, b, c= 3) {
  b = 10
  effect(arguments)
  return a + b + c
}

fn(1, 1, 1)

function func(a = 55) {
  a = 99; // updating a does not also update arguments[0]
  console.log(arguments[0]);
}
func(10);

function func(a = 55) {
  arguments[0] = 99; // updating arguments[0] does not also update a
  console.log(a);
}
func(10); // 10


