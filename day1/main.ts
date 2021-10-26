import { strict as assert } from "assert";
import { readFileSync } from "fs";

const solve1 = function (file: string): number {
  const nums: number[] = readFileSync(file, "utf-8")
    .split("\n")
    .map((num) => +num);
  return nums.reduce((a, b) => a + b, 0);
};

const solve2 = function (file: string): number {
  const nums: number[] = readFileSync(file, "utf-8")
    .split("\n")
    .map((num) => +num);

  var seen: Set<number> = new Set<number>();
  var sum: number = 0;
  var found: boolean = false;

  while (!found) {
    for (let num of nums) {
      seen.add(sum);
      sum = sum + num;

      if (seen.has(sum)) {
        found = true;
        break;
      }
    }
  }

  return sum;
};

assert(solve1("./example.txt") === 3);
console.log(solve1("./input.txt"));

assert(solve2("./example2.txt") === 2);
console.log(solve2("./input.txt"));
