import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

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

const run = (
  initial: Grid<string>,
  minutes: number,
  shouldPrint: boolean
): Grid<string> => {
  const grid = initial;
  if (shouldPrint) {
    console.log("Initial state:");
    console.log(grid.print());
  }

  for (let min = 1; min < minutes + 1; min++) {
    const newData = new Map();
    for (let y = 0; y < initial.maxY + 1; y++) {
      for (let x = 0; x < initial.maxX + 1; x++) {
        const pos = grid.toPos(x, y);
        const chr = grid.data.get(pos);

        const neighbours = grid.getAdjecent(x, y);
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
        newData.set(pos, newChr);
      }
    }
    grid.data = newData;

    if (shouldPrint) {
      console.log();
      console.log(`After ${min} minutes:`);
      console.log(grid.print());
    }
  }

  console.log();
  console.log(`After ${minutes} minutes:`);
  console.log(grid.print());

  return new Grid(grid.data, initial.maxX, initial.maxY);
};

const solve1 = (file: string): number => {
  let grid = Grid.parseGrid(parse(file));
  grid = run(grid, 10, true);

  return totalResourceValue(grid.data);
};

const solve2 = (file: string): number => {
  let grid = Grid.parseGrid(parse(file));
  // repeats every 28th after 502 minutes
  const minutes = 502 + ((1000000000 - 502) % 28);

  grid = run(grid, minutes, false);

  return totalResourceValue(grid.data);
};

assert(solve1("./example.txt") === 1147);
console.log(solve1("./input.txt"));

console.log(solve2("./input.txt"));

// 82 54 26 98
// 28 28
