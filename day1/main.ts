import { strict as assert } from "assert";
import { readFileSync } from "fs";

const solve1 = (file: string): number => {
  const nums: number[] = readFileSync(file, "utf-8")
    .trim()
    .split("\n")
    .map((num) => +num);
  return nums.reduce((a, b) => a + b, 0);
};

const solve2 = function (file: string): number {
  const nums: number[] = readFileSync(file, "utf-8")
    .trim()
    .split("\n")
    .map((num) => +num);

  const seen: Set<number> = new Set<number>();
  let sum = 0;
  let found = false;

  while (!found) {
    for (const num of nums) {
      seen.add(sum);
      sum += num;

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
