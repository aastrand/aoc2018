/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
class CPU {
  ip = 0;

  ipBind: number;

  regs: Array<number> = [0, 0, 0, 0, 0, 0];

  constructor(bind: number) {
    this.ipBind = bind;
  }

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

export { CPU };
