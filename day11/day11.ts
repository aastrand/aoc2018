import { strict as assert } from "assert";

const GRID_SIZE: number = 300;

const hundredsDigit = (level: number): number => {
  let digit = 0;
  if (level % 1000 > 99) {
    digit = +`${level % 1000}`.charAt(0);
  }

  return digit;
};

/*
Find the fuel cell's rack ID, which is its X coordinate plus 10.
Begin with a power level of the rack ID times the Y coordinate.
Increase the power level by the value of the grid serial number (your puzzle input).
Set the power level to itself multiplied by the rack ID.
Keep only the hundreds digit of the power level (so 12345 becomes 3;
numbers with no hundreds digit become 0).
Subtract 5 from the power level.
*/
const powerLevel = (x: number, y: number, serial: number): number => {
  // The rack ID is 3 + 10 = 13.
  const rackId = x + 10;
  // The power level starts at 13 * 5 = 65.
  let level = rackId * y;
  // Adding the serial number produces 65 + 8 = 73.
  level += serial;
  // Multiplying by the rack ID produces 73 * 13 = 949.
  level *= rackId;
  // The hundreds digit of 949 is 9.
  level = hundredsDigit(level);
  // Subtracting 5 produces 9 - 5 = 4.
  level -= 5;

  return level;
};

const createGrid = (serial: number): Map<string, number> => {
  const grid: Map<string, number> = new Map();

  for (let x = 1; x < GRID_SIZE + 1; x++) {
    for (let y = 1; y < GRID_SIZE + 1; y++) {
      grid.set(`${x},${y}`, powerLevel(x, y, serial));
    }
  }

  return grid;
};

const findMax = (grid: Map<string, number>, size: number): [string, number] => {
  let maxLevel = 0;
  let maxPos = "";

  for (let x = 1; x < GRID_SIZE + 1 - size; x++) {
    for (let y = 1; y < GRID_SIZE + 1 - size; y++) {
      let level = 0;

      for (let dx = 0; dx < size; dx++) {
        for (let dy = 0; dy < size; dy++) {
          level += grid.get(`${x + dx},${y + dy}`) || 0;
        }
      }

      if (level > maxLevel) {
        maxLevel = level;
        maxPos = `${x},${y}`;
      }
    }
  }

  return [maxPos, maxLevel];
};

const solve1 = (serial: number): string => {
  const grid = createGrid(serial);
  return findMax(grid, 3)[0];
};

const solve2 = (serial: number): string => {
  const grid = createGrid(serial);

  let bestSize = 0;
  let maxPos = "";
  let maxGridSize = 0;

  for (let size = 12; size < 17; size++) {
    const candidate = findMax(grid, size);

    if (candidate[1] > bestSize) {
      bestSize = candidate[1];
      maxPos = candidate[0];
      maxGridSize = size;
    }
  }

  return `${maxPos},${maxGridSize}`;
};

assert(powerLevel(3, 5, 8) === 4);
/*
Fuel cell at  122,79, grid serial number 57: power level -5.
Fuel cell at 217,196, grid serial number 39: power level  0.
Fuel cell at 101,153, grid serial number 71: power level  4.
*/
assert(powerLevel(122, 79, 57) === -5);
assert(powerLevel(217, 196, 39) === 0);
assert(powerLevel(101, 153, 71) === 4);

assert(solve1(18) === "33,45");
assert(solve1(42) === "21,61");

console.log(solve1(5093));

/*
For grid serial number 18, the largest total square (with a total power of 113) is 16x16
and has a top-left corner of 90,269, so its identifier is 90,269,16.
*/
assert(solve2(18) === "90,269,16");
/*
For grid serial number 42, the largest total square (with a total power of 119) is 12x12
and has a top-left corner of 232,251, so its identifier is 232,251,12.
*/
assert(solve2(42) === "232,251,12");

console.log(solve2(5093));
