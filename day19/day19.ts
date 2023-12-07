/* eslint-disable no-param-reassign */
import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { CPU } from "../cpu";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve1 = (file: string): number => {
  const lines = parse(file);
  const bind = +lines[0].split(" ")[1];
  lines.shift();
  const mem = lines.map((line) => line.split(" "));
  const cpu = new CPU(bind);

  cpu.run(mem);

  return cpu.regs[0];
};

const solve2 = (file: string): string => {
  const lines = parse(file);
  const bind = +lines[0].split(" ")[1];
  lines.shift();
  const mem = lines.map((line) => line.split(" "));
  mem[mem.length - 1] = ["seti", "256", "0", "5"];

  const cpu = new CPU(bind);
  cpu.regs[0] = 1;

  cpu.run(mem);

  return `https://www.wolframalpha.com/input/?i=sum+of+factors+${cpu.regs[1]}`;
};

assert(solve1("./example.txt") === 6);
console.log(solve1("../input/2018/day19.txt"));

console.log(solve2("../input/2018/day19.txt"));
