import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Count {
  count: number;
  ids: Array<string>;
}

interface Cut {
  id: string;
  coords: Array<string>;
}

const parseCut = (cut: string): Cut => {
  const coords: Array<string> = [];
  const id = cut.trim().split("@")[0];
  const nums = cut.trim().split("@")[1];
  const xStart = +nums.split(": ")[0].split(",")[0];
  const yStart = +nums.split(": ")[0].split(",")[1];
  const width = +nums.split(": ")[1].split("x")[0];
  const height = +nums.split(": ")[1].split("x")[1];

  for (let y = yStart + 1; y < yStart + height + 1; y++) {
    for (let x = xStart + 1; x < xStart + width + 1; x++) {
      coords.push(`${x},${y}`);
    }
  }

  return { id, coords };
};

const mapOverlap = (lines: string[]): Map<string, Count> => {
  const seen: Map<string, Count> = new Map();

  for (const line of lines) {
    const cut = parseCut(line);
    for (const coord of cut.coords) {
      const prev = seen.get(coord);
      const count = prev ? prev.count + 1 : 1;
      const ids = [cut.id];
      for (const prevId of prev?.ids) {
        ids.push(prevId);
      }
      seen.set(coord, { count, ids });
    }
  }

  return seen;
};

const solve1 = (file: string): number => {
  const seen: Map<string, Count> = mapOverlap(parse(file));
  let twoOrMore = 0;
  for (const cut of seen.values()) {
    if (cut.count > 1) {
      twoOrMore++;
    }
  }

  return twoOrMore;
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  const idToNumOfInches: Map<string, number> = new Map();
  for (const line of lines) {
    const cut = parseCut(line);
    idToNumOfInches.set(cut.id, cut.coords.length);
  }

  const seen: Map<string, Count> = mapOverlap(parse(file));
  const idsToNoneOverlapped: Map<string, number> = new Map();
  for (const count of seen.values()) {
    if (count.ids.length === 1) {
      const overlapped = idsToNoneOverlapped.get(count.ids[0]);
      idsToNoneOverlapped.set(count.ids[0], overlapped ? overlapped + 1 : 1);
    }
  }

  for (const id of idsToNoneOverlapped.keys()) {
    if (idToNumOfInches.get(id) === idsToNoneOverlapped.get(id)) {
      return +id.substring(1);
    }
  }

  throw "Id not found!";
};

assert(solve1("./example.txt") === 4);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 3);
console.log(solve2("./input.txt"));
