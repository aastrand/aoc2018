/* eslint-disable no-bitwise */
import { strict as assert } from "assert";
import { readFileSync } from "fs";

class CPU {
  regs: Array<number> = [0, 0, 0, 0];

  addr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] + this.regs[regB];
  }

  addi(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] + value;
  }

  mulr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] * this.regs[regB];
  }

  muli(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] * value;
  }

  banr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] & this.regs[regB];
  }

  bani(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] & value;
  }

  borr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] | this.regs[regB];
  }

  bori(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] | value;
  }

  setr(regA: number, _: number, outReg: number) {
    this.regs[outReg] = this.regs[regA];
  }

  seti(value: number, _: number, outReg: number) {
    this.regs[outReg] = value;
  }

  gtir(value: number, regB: number, outReg: number) {
    this.regs[outReg] = value > this.regs[regB] ? 1 : 0;
  }

  gtri(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] > value ? 1 : 0;
  }

  gtrr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] > this.regs[regB] ? 1 : 0;
  }

  eqir(value: number, regB: number, outReg: number) {
    this.regs[outReg] = value === this.regs[regB] ? 1 : 0;
  }

  eqri(regA: number, value: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] === value ? 1 : 0;
  }

  eqrr(regA: number, regB: number, outReg: number) {
    this.regs[outReg] = this.regs[regA] === this.regs[regB] ? 1 : 0;
  }

  instructions: Array<string> = [
    "gtri", // 0
    "bani", // 1
    "eqrr", // 2
    "gtir", // 3
    "eqir", // 4
    "bori", // 5
    "seti", // 6
    "setr", // 7
    "addr", // 8
    "borr", // 9
    "muli", // 10
    "banr", // 11
    "addi", // 12
    "eqri", // 13
    "mulr", // 14
    "gtrr", // 15
  ];
}

const stateRe = /.*:[ ]+\[([0-9, ]+)\].*/;

const solve1 = (file: string): number => {
  const lines = readFileSync(file, "utf-8")
    .trim()
    .split("\n\n\n")[0]
    .split("\n\n");

  const cpu = new CPU();

  const matches: Map<number, Set<string>> = new Map();
  for (let i = 0; i < 16; i++) {
    matches.set(i, new Set());
  }

  let total = 0;
  for (const line of lines) {
    const parts = line.split("\n");
    const before = stateRe
      .exec(parts[0])[1]
      .split(", ")
      .map((n) => +n);
    const instr = parts[1].split(" ").map((n) => +n);
    const after = stateRe
      .exec(parts[2])[1]
      .split(", ")
      .map((n) => +n);

    const matching = [];
    for (const instrName of cpu.instructions) {
      for (let i = 0; i < before.length; i++) {
        cpu.regs[i] = before[i];
      }

      cpu[instrName](instr[1], instr[2], instr[3]);

      if (
        cpu.regs[0] === after[0] &&
        cpu.regs[1] === after[1] &&
        cpu.regs[2] === after[2] &&
        cpu.regs[3] === after[3]
      ) {
        matching.push(instrName);
        matches.get(instr[0]).add(instrName);
      }
    }

    if (matching.length >= 3) {
      total++;
    }
  }

  const mapping: Array<[string, number]> = [];
  for (let i = 0; i < 16; i++) {
    let cur = "";
    let found = false;
    matches.forEach((instructions, opcode) => {
      if (!found && instructions.size === 1) {
        instructions.forEach((value) => {
          cur = value;
        });
        mapping.push([cur, opcode]);
        found = true;
      }
    });

    matches.forEach((instructions) => {
      instructions.delete(cur);
    });
  }

  mapping.sort((a, b) => {
    if (a[1] > b[1]) {
      return 1;
    }
    if (a[1] < b[1]) {
      return -1;
    }
    return 0;
  });
  for (const pair of mapping) {
    console.log(`"${pair[0]}", // ${pair[1]}`);
  }

  return total;
};

const solve2 = (file: string): number => {
  const lines = readFileSync(file, "utf-8")
    .trim()
    .split("\n\n\n")[1]
    .split("\n");

  const cpu = new CPU();
  for (const line of lines) {
    const instr = line.split(" ").map((n) => +n);
    cpu[cpu.instructions[instr[0]]](instr[1], instr[2], instr[3]);
  }

  return cpu.regs[0];
};

assert(solve1("./example.txt") === 1);
console.log(solve1("./input.txt"));

console.log(solve2("./input.txt"));
