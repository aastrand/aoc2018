/* eslint-disable no-shadow */
import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

function toPos(x: number, y: number): string {
  return `${x},${y}`;
}

enum Found {
  clay = 1,
  end,
  water,
  sand,
}

interface FallResult {
  pos?: [number, number];
  found: Found;
}

class Grid {
  grid: Map<string, string> = new Map();

  globalXMin: number = Number.MAX_SAFE_INTEGER;

  globalXMax = 0;

  globalYMin: number = Number.MAX_SAFE_INTEGER;

  globalYMax = 0;

  currentDepth = 0;

  constructor(lines: string[]) {
    this.grid.set(toPos(500, 0), "+");

    for (const line of lines) {
      let xMin = 0;
      let xMax = 0;
      let yMin = 0;
      let yMax = 0;

      for (const parts of line.split(", ")) {
        if (parts.indexOf("..") > -1) {
          const sub = parts.split("=")[1].split("..");
          if (parts[0] === "x") {
            xMin = +sub[0];
            xMax = +sub[1] + 1;
          } else {
            yMin = +sub[0];
            yMax = +sub[1] + 1;
          }
        } else if (parts[0] === "x") {
          xMin = +parts.split("=")[1];
          xMax = xMin + 1;
        } else {
          yMin = +parts.split("=")[1];
          yMax = yMin + 1;
        }
      }

      for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
          this.grid.set(toPos(x, y), "#");

          if (this.globalXMin > x) {
            this.globalXMin = x;
          }
          if (this.globalXMax < x) {
            this.globalXMax = x;
          }
          if (this.globalYMin > y) {
            this.globalYMin = y;
          }
          if (this.globalYMax < y) {
            this.globalYMax = y;
          }
        }
      }
    }
  }

  get(x: number, y: number): string {
    return this.grid.get(toPos(x, y)) || ".";
  }

  set(x: number, y: number, val: string) {
    this.grid.set(toPos(x, y), val);
  }

  print(debug: boolean) {
    for (let y = 0; y < this.globalYMax + 1; y++) {
      if (debug && y > this.currentDepth + 5) {
        break;
      }

      let line = `${y} `;
      for (let x = this.globalXMin - 1; x < this.globalXMax + 2; x++) {
        line += this.grid.get(toPos(x, y)) || ".";
      }
      console.log(line);
    }
  }

  fall(x: number, y: number): FallResult {
    let yd = y;

    while (yd < this.globalYMax + 1) {
      if (this.currentDepth < yd) {
        this.currentDepth = yd;
      }

      const cur = this.get(x, yd);
      if (cur === ".") {
        this.set(x, yd, "|");
      } else if (cur === "|") {
        return { found: Found.sand };
      } else if (cur === "#") {
        return { pos: [x, yd - 1], found: Found.clay };
      } else if (cur === "~") {
        return { pos: [x, yd - 1], found: Found.water };
      } else {
        this.set(x, yd, "O");
        this.print(true);
        throw `unexpected value while falling: ${cur} at ${toPos(x, yd)}`;
      }
      yd++;
    }
    return { found: Found.end };
  }

  spread(x: number, y: number): Array<[number, number]> | null {
    const results: Array<[number, number]> = [];

    const start = this.get(x, y);
    if (start === "~") {
      return null;
    }

    this.set(x, y, "~");
    const offsets = [-1, 1];
    const interval = [];

    for (const offset of offsets) {
      let xd = x;
      let done = false;
      while (!done) {
        xd += offset;
        const cur = this.get(xd, y);
        const below = this.get(xd, y + 1);

        if (cur === "." || cur === "|") {
          this.set(xd, y, "~");
        }

        if (cur === "#") {
          done = true;
        } else if (cur === "~") {
          done = true;
        } else if (cur === "|") {
          if (this.get(xd + offset, y) === "." && below === "|") {
            done = true;
          } else if (
            this.get(xd + offset, y) === "|" ||
            this.get(xd + offset, y) === "#"
          ) {
            this.set(xd, y, "~");
          }
        } else if (below === ".") {
          this.set(xd, y, ".");
          results.push([xd, y]);
          done = true;
        } else if (cur !== ".") {
          this.set(xd, y, "O");
          this.print(true);
          throw `unexpected value while spreading: ${cur} at ${toPos(xd, y)}`;
        }
      }

      interval.push(xd);
    }

    if (results.length > 0) {
      for (let xd = interval[0] + 1; xd < interval[1]; xd++) {
        this.set(xd, y, "|");
      }
    }

    return results;
  }

  solve() {
    const falls: Array<[number, number]> = [];
    falls.push([500, 1]);
    while (falls.length > 0) {
      const fall = falls.pop();
      const result = this.fall(fall[0], fall[1]);
      let yOffset = 0;

      if (result.found === Found.clay || result.found === Found.water) {
        let done = false;
        while (!done) {
          const spread = this.spread(result.pos[0], result.pos[1] - yOffset);
          if (!spread) {
            done = true;
            break;
          }

          if (spread.length === 0) {
            yOffset++;
          } else {
            for (const f of spread) {
              falls.push(f);
            }
            done = true;
          }
        }
      }
    }
  }

  count(): number {
    let total = 0;
    this.grid.forEach((value, pos) => {
      if (
        (value === "|" || value === "~") &&
        +pos.split(",")[1] >= this.globalYMin
      ) {
        total++;
      }
    });
    return total;
  }

  count2(): number {
    let total = 0;
    this.grid.forEach((value, pos) => {
      if (value === "~" && +pos.split(",")[1] >= this.globalYMin) {
        total++;
      }
    });
    return total;
  }
}

const solve1 = (file: string): number => {
  const grid = new Grid(parse(file));
  grid.solve();
  grid.print(false);

  return grid.count();
};

const solve2 = (file: string): number => {
  const grid = new Grid(parse(file));
  grid.solve();
  grid.print(false);

  return grid.count2();
};

assert(solve1("./example.txt") === 57);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 29);
console.log(solve2("./input.txt"));
