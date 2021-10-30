import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = function (file: string): string[] {
  return readFileSync(file, "utf-8").trim().split("\n");
};

interface Count {
  count: number;
  ids: Array<string>;
}

interface Cut {
  id: string;
  coords: Array<string>;
}

const parseCut = function (cut: string): Cut {
  var coords: Array<string> = [];
  const id = cut.trim().split("@")[0];
  const nums = cut.trim().split("@")[1];
  const x_start = +nums.split(": ")[0].split(",")[0];
  const y_start = +nums.split(": ")[0].split(",")[1];
  const width = +nums.split(": ")[1].split("x")[0];
  const height = +nums.split(": ")[1].split("x")[1];

  for (let y = y_start + 1; y < y_start + height + 1; y++) {
    for (let x = x_start + 1; x < x_start + width + 1; x++) {
      coords.push(x + "," + y);
    }
  }

  return { id: id, coords: coords };
};

const mapOverlap = function (lines: string[]): Map<string, Count> {
  const seen: Map<string, Count> = new Map();

  for (let line of lines) {
    const cut = parseCut(line);
    for (let coord of cut.coords) {
      const prev = seen.get(coord);
      const count = prev ? prev.count + 1 : 1;
      const ids = [cut.id];
      for (let prev_id in prev?.ids) {
        ids.push(prev_id);
      }
      seen.set(coord, { count: count, ids: ids });
    }
  }

  return seen;
};

const solve1 = function (file: string): number {
  const seen: Map<string, Count> = mapOverlap(parse(file));
  var twoOrMore = 0;
  for (let cut of seen.values()) {
    if (cut.count > 1) {
      twoOrMore++;
    }
  }

  return twoOrMore;
};

const solve2 = function (file: string): number {
  const lines = parse(file);

  var idToNumOfInches: Map<String, number> = new Map();
  for (let line of lines) {
    const cut = parseCut(line);
    idToNumOfInches.set(cut.id, cut.coords.length);
  }

  const seen: Map<string, Count> = mapOverlap(parse(file));
  var idsToNoneOverlapped: Map<string, number> = new Map();
  for (let count of seen.values()) {
    if (count.ids.length == 1) {
      const overlapped = idsToNoneOverlapped.get(count.ids[0]);
      idsToNoneOverlapped.set(count.ids[0], overlapped ? overlapped + 1 : 1);
    }
  }

  for (let id of idsToNoneOverlapped.keys()) {
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
