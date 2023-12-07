/* eslint-disable no-nested-ternary */
import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const grow = (lines: string[], generations: number): [number, string] => {
  let state = lines[0].split("initial state: ")[1];

  const transform: Map<string, string> = new Map();
  for (const line of lines.slice(2)) {
    const parts = line.split(" => ");
    transform.set(parts[0], parts[1]);
  }

  // console.log(`0: ${state}`);
  let offset = 0;
  for (let gen = 1; gen < generations + 1; gen++) {
    if (state[0] === "#") {
      state = `.${state}`;
      offset += 1;
    }

    if (state[state.length - 1] === "#") {
      state += ".";
    }

    let newState = "";
    for (let i = 0; i < state.length; i++) {
      const prefix = i === 0 ? ".." : i === 1 ? "." : "";
      const suffix =
        i === state.length - 1 ? ".." : i === state.length - 2 ? "." : "";

      const start = Math.max(0, i - 2);
      const end = Math.min(state.length + 1, i + 3);
      const middle = state.slice(start, end);

      const part = `${prefix}${middle}${suffix}`;
      let next = transform.get(part);
      if (!next) {
        next = ".";
      }

      newState += next;
    }

    state = newState;
    // console.log(`${gen}: ${state}`);
  }

  return [offset, state];
};

const solve1 = (file: string): number => {
  const result = grow(parse(file), 20);
  const offset = result[0];
  const state = result[1];

  let total = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] === "#") {
      total += i - offset;
    }
  }

  return total;
};

const solve2 = (file: string): number => {
  const generations = 158;
  const target = 50000000000;

  const result = grow(parse(file), generations);
  const offset = result[0];
  const state = result[1];

  const targetOffset = target - generations;

  let total = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] === "#") {
      total += i + targetOffset - offset;
    }
  }

  return total;
};

assert(solve1("./example.txt") === 325);
console.log(solve1("../input/2018/day12.txt"));

console.log(solve2("../input/2018/day12.txt"));
