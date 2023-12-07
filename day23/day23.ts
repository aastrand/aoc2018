import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Bot {
  x: number;
  y: number;
  z: number;
  r: number;
}

const botRegex = /pos=<([0-9-]+),([0-9-]+),([0-9-]+)>, r=([0-9]+)/;

const getBots = (lines: string[]): Array<Bot> => {
  const bots: Array<Bot> = [];
  for (const line of lines) {
    const match = botRegex.exec(line);
    bots.push({ x: +match[1], y: +match[2], z: +match[3], r: +match[4] });
  }

  return bots;
};

const mhDist = (a: Bot, b: Bot): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
};

const solve1 = (file: string): number => {
  const bots = getBots(parse(file));

  bots.sort((a, b) => {
    return b.r - a.r;
  });
  const chosen = bots[0];

  let inRange = 0;
  for (const bot of bots) {
    if (mhDist(chosen, bot) <= chosen.r) {
      inRange++;
    }
  }

  return inRange;
};

assert(solve1("./example.txt") === 7);
console.log(solve1("../input/2018/day23.txt"));
