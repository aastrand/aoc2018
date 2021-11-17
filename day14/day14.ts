import { strict as assert } from "assert";

const solve1 = (n: number): string => {
  const recipes: Array<number> = [3, 7];
  let e1 = 0;
  let e2 = 1;

  while (recipes.length < n + 10) {
    const sum = recipes[e1] + recipes[e2];
    const digits = `${sum}`;
    for (let i = 0; i < digits.length; i++) {
      recipes.push(+digits[i]);
    }
    e1 = (e1 + recipes[e1] + 1) % recipes.length;
    e2 = (e2 + recipes[e2] + 1) % recipes.length;
  }

  let r = "";
  for (let i = n; i < n + 10; i++) {
    r += recipes[i];
  }

  return r;
};

const indexOf = (start: number, r: Array<number>, n: Array<number>): number => {
  if (r.length < n.length) {
    return -1;
  }

  for (let i = start; i < r.length - n.length + 1; i++) {
    if (r[i] === n[0]) {
      let equal = true;
      for (let j = 0; j < n.length; j++) {
        equal = equal && r[i + j] === n[j];
      }
      if (equal) {
        return i;
      }
    }
  }

  return -1;
};

const endsIn = (r: Array<number>, n: Array<number>): number => {
  if (r.length < n.length) {
    return -1;
  }

  let equal = true;
  for (let i = n.length - 1; i > -1; i--) {
    equal = equal && r[r.length - 1 - (n.length - i - 1)] === n[i];
  }

  return equal ? r.length - n.length : -1;
};

const solve2 = (n: string): number => {
  const nums = n.split("").map((num) => +num);
  const recipes: Array<number> = [3, 7];

  let e1 = 0;
  let e2 = 1;

  let r = -1;
  while (r === -1) {
    const sum = recipes[e1] + recipes[e2];
    const digits = `${sum}`;
    for (let i = 0; i < digits.length; i++) {
      recipes.push(+digits[i]);
    }
    e1 = (e1 + recipes[e1] + 1) % recipes.length;
    e2 = (e2 + recipes[e2] + 1) % recipes.length;

    r = indexOf(recipes.length - nums.length, recipes, nums);
    if (r === -1) {
      r = indexOf(recipes.length - nums.length - 1, recipes, nums);
    }
  }

  return r;
};

assert(solve1(9) === "5158916779");
assert(solve1(5) === "0124515891");
assert(solve1(18) === "9251071085");
assert(solve1(2018) === "5941429882");
console.log(solve1(580741));

assert(indexOf(0, [1, 2, 3], [4, 5, 6, 7]) === -1);
assert(indexOf(0, [1, 2, 3], [2, 3]) === 1);
assert(indexOf(0, [1, 2, 3, 4, 5, 6], [4, 5, 6]) === 3);
assert(indexOf(3, [1, 2, 3, 4, 5, 6], [4, 5, 6]) === 3);

assert(endsIn([1, 2, 3], [4, 5, 6, 7]) === -1);
assert(endsIn([1, 2, 3], [2, 3]) === 1);
assert(endsIn([1, 2, 3, 4, 5, 6], [4, 5, 6]) === 3);
assert(endsIn([1, 2, 3, 4, 5, 6], [4, 5]) === -1);

assert(solve2("51589") === 9);
assert(solve2("01245") === 5);
assert(solve2("92510") === 18);
assert(solve2("59414") === 2018);
console.log(solve2("580741"));
