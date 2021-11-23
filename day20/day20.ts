/* eslint-disable no-case-declarations */
import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { bfs, parseGraph } from "../graph";
import { Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const example = "^ENWWW(NEEE|SSE(EE|N))$";

const findClosingParenAndDividers = (
  str: string,
  start: number
): { idx: number; dividers: number[] } => {
  let idx = -1;
  const dividers = [];
  let balance = 0;

  for (let i = start; i < str.length; i++) {
    const chr = str[i];
    if (chr === "(") {
      balance++;
    } else if (chr === ")") {
      balance--;
    } else if (chr === "|" && balance === 1) {
      dividers.push(i);
    }

    if (balance === 0) {
      idx = i;
      break;
    }
  }

  dividers.push(str.length);

  return { idx, dividers };
};

const directions = {
  N: [0, -1],
  S: [0, 1],
  W: [-1, 0],
  E: [1, 0],
};

const walkRegex = (
  x: number,
  y: number,
  data: Map<string, string>,
  line: string,
  start: number,
  end: number
): void => {
  const pos = [x, y];

  for (let i = start; i < end; i++) {
    const chr = line[i];
    switch (chr) {
      case "N":
      case "S":
        pos[0] += directions[chr][0];
        pos[1] += directions[chr][1];
        data.set(Grid.toPos(pos[0], pos[1]), "-");
        pos[0] += directions[chr][0];
        pos[1] += directions[chr][1];
        data.set(Grid.toPos(pos[0], pos[1]), ".");
        break;
      case "E":
      case "W":
        pos[0] += directions[chr][0];
        pos[1] += directions[chr][1];
        data.set(Grid.toPos(pos[0], pos[1]), "|");
        pos[0] += directions[chr][0];
        pos[1] += directions[chr][1];
        data.set(Grid.toPos(pos[0], pos[1]), ".");
        break;
      case "(":
        const positions = findClosingParenAndDividers(line, i);
        const subString = line.substring(i + 1, positions.idx);

        let subStart = -1;
        for (const diviser of positions.dividers) {
          const part = subString.substring(subStart + 1, diviser - i - 1);
          walkRegex(pos[0], pos[1], data, part, 0, part.length);
          subStart = diviser - i - 1;
        }

        i = positions.idx;
        break;
      default:
        break;
    }
  }
};

const walkPath = (
  from: string,
  paths: Map<string, Array<string>>
): Array<string> => {
  const ret = [];

  let parent = paths.get(from)[0];
  while (parent) {
    ret.push(parent);
    parent = paths.get(parent)[0];
  }

  return ret;
};

const solve = (file: string): { max: number; count: number } => {
  const line = parse(file)[0];
  const data = new Map();

  data.set(Grid.toPos(0, 0), "X");

  walkRegex(0, 0, data, line, 0, line.length);
  let maxX = 0;
  let maxY = 0;
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;

  data.forEach((value, p) => {
    const pos = Grid.fromPos(p);
    if (maxX < pos[0]) {
      maxX = pos[0];
    }
    if (maxY < pos[1]) {
      maxY = pos[1];
    }
    if (minX > pos[0]) {
      minX = pos[0];
    }
    if (minY > pos[1]) {
      minY = pos[1];
    }
  });

  const grid = new Grid(data, minX - 1, maxX + 1, minY - 1, maxY + 1);
  console.log(grid.print("#"));

  const graph = parseGraph(grid, new Set(["X", ".", "|", "-"]));
  const paths = bfs(Grid.toPos(0, 0), graph);

  let maxPath = [];
  let pathCount = 0;
  grid.data.forEach((value, pos) => {
    if (value === ".") {
      const path = walkPath(pos, paths);
      if (path.length > maxPath.length) {
        maxPath = path;
      }
      if (path.length / 2 >= 1000) {
        pathCount++;
      }
    }
  });

  return { max: maxPath.length / 2, count: pathCount };
};

assert(findClosingParenAndDividers(example, 6).idx === example.length - 2);
assert(findClosingParenAndDividers(example, 6).dividers[0] === 11);
assert(findClosingParenAndDividers(example, 6).dividers[1] === 23);

assert(solve("./example.txt").max === 10);
assert(solve("./example2.txt").max === 18);
assert(solve("./example3.txt").max === 23);
assert(solve("./example4.txt").max === 31);
const solution = solve("./input.txt");
console.log(solution.max);
console.log(solution.count);
