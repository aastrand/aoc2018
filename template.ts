import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve1 = (file: string): number => {
  const lines = parse(file);

  return 0;
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  return 0;
};

assert(solve1("./example.txt") === 3);
console.log(solve1("./input.txt"));

// assert(solve2('./example.txt') === 2);
console.log(solve2("./input.txt"));
