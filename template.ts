import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = function (file: string): string[] {
  return readFileSync(file, "utf-8")
    .trim()
    .split("\n");
};

const solve1 = function (file: string): number {
  const lines = parse(file);

  return 0;
};

const solve2 = function (file: string): number {
  const lines = parse(file); 

  return 0;
};

//assert(solve1("./example.txt") === 3);
console.log(solve1("./input.txt"));

//assert(solve2("./example2.txt") === 2);
console.log(solve2("./input.txt"));
