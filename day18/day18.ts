import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

function toPos(x: number, y: number): string {
  return `${x},${y}`;
}

const adjecent: Array<[number, number]> = [
  [-1, 0], // left
  [1, 0], // right

  [1, -1], // bottom right
  [0, -1], // bottom middle
  [-1, -1], // bottom left

  [1, 1], // top right
  [0, 1], // top middle
  [-1, 1], // top left
];

const getAdjecent = (
  grid: Map<string, string>,
  x: number,
  y: number
): Array<string> => {
  const neighbours = [];

  for (const offset of adjecent) {
    const chr = grid.get(toPos(x + offset[0], y + offset[1]));
    if (chr) {
      neighbours.push(chr);
    }
  }

  return neighbours;
};

const print = (map: Map<string, string>, maxX: number, maxY: number): void => {
  for (let y = 0; y < maxY + 1; y++) {
    let line = "";
    for (let x = 0; x < maxX + 1; x++) {
      line += map.get(toPos(x, y));
    }
    console.log(line);
  }
};

interface Grid {
  grid: Map<string, string>;
  maxX: number;
  maxY: number;
}

const getGrid = (lines: string[]): Grid => {
  const grid = new Map();
  let maxY = 0;
  let maxX = 0;
  for (let y = 0; y < lines.length; y++) {
    const chars = lines[y].split("");
    for (let x = 0; x < chars.length; x++) {
      grid.set(toPos(x, y), chars[x]);
      maxX = x;
    }
    maxY = y;
  }

  return { grid, maxX, maxY };
};

const totalResourceValue = (grid: Map<string, string>): number => {
  let wooded = 0;
  let lumber = 0;
  grid.forEach((value, _) => {
    if (value === "|") {
      wooded++;
    } else if (value === "#") {
      lumber++;
    }
  });

  return wooded * lumber;
};

const run = (initial: Grid, minutes: number, shouldPrint: boolean): Grid => {
  let grid = initial.grid;
  if (shouldPrint) {
    console.log("Initial state:");
    print(grid, initial.maxX, initial.maxY);
  }

  for (let min = 1; min < minutes + 1; min++) {
    const newGrid = new Map();
    for (let y = 0; y < initial.maxY + 1; y++) {
      for (let x = 0; x < initial.maxX + 1; x++) {
        const pos = toPos(x, y);
        const chr = grid.get(pos);

        const neighbours = getAdjecent(grid, x, y);
        let newChr;
        switch (chr) {
          case ".":
            newChr =
              neighbours.filter((n) => n === "|").length >= 3 ? "|" : ".";
            break;
          case "|":
            newChr =
              neighbours.filter((n) => n === "#").length >= 3 ? "#" : "|";
            break;
          case "#":
            newChr =
              neighbours.filter((n) => n === "#").length >= 1 &&
              neighbours.filter((n) => n === "|").length >= 1
                ? "#"
                : ".";
            break;
          default:
            throw `unexpected value at ${x},${y}: ${chr}`;
        }
        newGrid.set(pos, newChr);
      }
    }
    grid = newGrid;

    if (shouldPrint) {
      console.log();
      console.log(`After ${min} minutes:`);
      print(grid, initial.maxX, initial.maxY);
    }
  }

  console.log();
  console.log(`After ${minutes} minutes:`);
  print(grid, initial.maxX, initial.maxY);

  return { grid, maxX: initial.maxX, maxY: initial.maxY };
};

const solve1 = (file: string): number => {
  let grid = getGrid(parse(file));
  grid = run(grid, 10, true);

  return totalResourceValue(grid.grid);
};

const solve2 = (file: string): number => {
  let grid = getGrid(parse(file));
  // repeats every 28th after 502 minutes
  const minutes = 502 + ((1000000000 - 502) % 28);

  grid = run(grid, minutes, false);

  return totalResourceValue(grid.grid);
};

assert(solve1("./example.txt") === 1147);
console.log(solve1("./input.txt"));

console.log(solve2("./input.txt"));

// 82 54 26 98
// 28 28
