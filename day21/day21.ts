/* eslint-disable no-param-reassign */
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

  cpu.regs[0] = 15615244;
  //cpu.run(mem, false, new Set([28]));
  cpu.run(mem);

  return cpu.regs[0];
};

const run = (cpu: CPU, mem: Array<string[]>): number => {
  const repeats = new Set();
  let last = 0;
  while (cpu.ip < mem.length) {
    if (cpu.ip === 28) {
      if (repeats.has(cpu.regs[5])) {
        return last;
      }
      repeats.add(cpu.regs[5]);
      last = cpu.regs[5];
    }
    const instr = mem[cpu.ip];
    cpu.regs[cpu.ipBind] = cpu.ip;
    cpu[instr[0]](+instr[1], +instr[2], +instr[3]);
    cpu.ip = cpu.regs[cpu.ipBind];
    cpu.ip++;
  }

  throw "unexpectedly halted";
};

const solve2 = (file: string): number => {
  const lines = parse(file);
  const bind = +lines[0].split(" ")[1];
  lines.shift();
  const mem = lines.map((line) => line.split(" "));

  const cpu = new CPU(bind);

  cpu.regs[0] = Number.MAX_SAFE_INTEGER;
  return run(cpu, mem);
};

console.log(solve1("./input.txt"));
console.log(solve2("./input.txt"));
