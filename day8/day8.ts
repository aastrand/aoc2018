import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Result {
  sum: number;
  pos: number;
}

const find = (start: number, data: string[]): Result => {
  let pos = start;
  const children = +data[pos];
  const metadata = +data[pos + 1];

  let childsum = 0;
  for (let c = 0; c < children; c++) {
    const result = find(pos + 2, data);
    childsum += result.sum;
    pos = result.pos;
  }

  let sum = 0;
  for (let m = 0; m < metadata; m++) {
    sum += +data[pos + 2 + m];
  }

  return { sum: sum + childsum, pos: pos + metadata };
};

const solve1 = (file: string): number => {
  const data = parse(file)[0].split(" ");
  return find(0, data).sum;
};

const find2 = (start: number, data: string[]): Result => {
  let pos = start;
  const children = +data[pos];
  const metadata = +data[pos + 1];

  const childData = [];
  for (let c = 0; c < children; c++) {
    const result = find2(pos + 2, data);
    childData.push(result);
    pos = result.pos;
  }

  let sum = 0;

  for (let m = 0; m < metadata; m++) {
    const num = +data[pos + 2 + m];
    if (!children) {
      sum += num;
    } else if (num - 1 < childData.length) {
      sum += childData[num - 1].sum;
    }
  }

  return { sum, pos: pos + metadata };
};

const solve2 = (file: string): number => {
  const data = parse(file)[0].split(" ");
  return find2(0, data).sum;
};

assert(solve1("./example.txt") === 138);
console.log(solve1("../input/2018/day8.txt"));

assert(solve2("./example.txt") === 66);
console.log(solve2("../input/2018/day8.txt"));
