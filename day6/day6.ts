/* eslint-disable max-len */
/* eslint-disable guard-for-in */
import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

class Coord {
  x: number;

  y: number;

  id: string;

  constructor(x: number, y: number, id: string) {
    this.x = x;
    this.y = y;
    this.id = id;
  }

  toString = (): string => `${this.x}, ${this.y}`;
}

const manHattanDistance = ({
  x1,
  x2,
  y1,
  y2,
}: {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}): number => Math.abs(x2 - x1) + Math.abs(y2 - y1);

const findClosest = (
  x: number,
  y: number,
  coords: Map<string, Coord>
): string => {
  let minPos: Coord | null = null;
  let minDistance: number = Number.MAX_SAFE_INTEGER;
  let minDistanceCount = 0;
  for (const pos of coords.values()) {
    const distance = manHattanDistance({
      x1: pos.x,
      x2: x,
      y1: pos.y,
      y2: y,
    });
    if (minDistance === distance) {
      minDistanceCount++;
    } else if (minDistance > distance) {
      minDistance = distance;
      minPos = pos;
      minDistanceCount = 0;
    }
  }

  if (minDistanceCount > 0) {
    return ".";
  }

  if (!minPos) {
    throw "position not found";
  }

  return coords.get(minPos.toString())?.id || "";
};

interface Grid {
  coords: Map<string, Coord>;
  maxX: number;
  maxY: number;
}

const parseGrid = (lines: string[]): Grid => {
  const coords: Map<string, Coord> = new Map();
  let maxX = 0;
  let maxY = 0;

  for (const i in lines) {
    const coord = lines[i].split(", ");
    const obj = new Coord(+coord[0], +coord[1], i);
    coords.set(obj.toString(), obj);

    if (maxX < +coord[0]) {
      maxX = +coord[0];
    }
    if (maxY < +coord[1]) {
      maxY = +coord[1];
    }
  }

  return { coords, maxX, maxY };
};

const solve1 = (file: string): number => {
  const grid = parseGrid(parse(file));

  const excludedAreas: Set<string> = new Set();
  const areas: Map<string, number> = new Map();
  for (let x = 0; x < grid.maxX + 1; x++) {
    for (let y = 0; y < grid.maxY + 1; y++) {
      const pos = findClosest(x, y, grid.coords);
      if (pos !== ".") {
        let count = areas.get(pos);
        if (!count) {
          count = 0;
        }

        areas.set(pos, count + 1);
        if (x === 0 || x === grid.maxX || y === 0 || y === grid.maxY) {
          excludedAreas.add(pos);
        }
      }
    }
  }

  let maxSize = 0;
  for (const area of areas.keys()) {
    if (!excludedAreas.has(area)) {
      const size = areas.get(area) || 0;
      if (maxSize < size) {
        maxSize = size;
      }
    }
  }

  return maxSize;
};

const solve2 = (file: string, size: number): number => {
  const grid = parseGrid(parse(file));

  let areaSize = 0;
  for (let x = 0; x < grid.maxX + 1; x++) {
    for (let y = 0; y < grid.maxY + 1; y++) {
      let areaSum = 0;
      for (const pos of grid.coords.values()) {
        areaSum += manHattanDistance({
          x1: pos.x,
          x2: x,
          y1: pos.y,
          y2: y,
        });
      }

      if (areaSum < size) {
        areaSize++;
      }
    }
  }

  return areaSize;
};

const testFindClosest = () => {
  const coords: Map<string, Coord> = new Map();
  const coord1 = new Coord(4, 4, "0");
  const coord2 = new Coord(1, 1, "1");
  const coord3 = new Coord(3, 1, "2");

  coords.set(coord1.toString(), coord1);
  coords.set(coord2.toString(), coord2);
  coords.set(coord3.toString(), coord3);

  assert(findClosest(0, 0, coords) === "1");
  assert(findClosest(5, 5, coords) === "0");
  assert(findClosest(3, 3, coords) === ".");
  assert(findClosest(2, 1, coords) === ".");
};

testFindClosest();

assert(solve1("./example.txt") === 17);
console.log(solve1("../input/2018/day6.txt"));

assert(solve2("./example.txt", 32) === 16);
console.log(solve2("../input/2018/day6.txt", 10000));
