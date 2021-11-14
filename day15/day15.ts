import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

export enum Race {
  E = 1,
  G,
}

export class Unit {
  race: Race;
  hp = 200;
  ap = 3;
  x: number;
  y: number;

  constructor(race: Race, x: number, y: number) {
    this.race = race;
    this.x = x;
    this.y = y;
  }

  attack(unit: Unit): void {
    unit.hp -= this.ap;
  }

  pos(): string {
    return toPos(this.x, this.y);
  }

  toString(): string {
    return `${Race[this.race]}(${this.hp})`;
  }
}

export interface Grid {
  data: Map<string, string>;
  maxX: number;
  maxY: number;
}

const toPos = (x: number, y: number): string => {
  return `${x},${y}`;
};

export const parseGrid = (lines: string[]): Grid => {
  const data: Map<string, string> = new Map();
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      data.set(toPos(x, y), lines[y][x]);

      if (maxX < x) {
        maxX = x;
      }
      if (maxY < y) {
        maxY = y;
      }
    }
  }

  return { data, maxX, maxY };
};

export const extractUnits = (grid: Grid): Map<string, Unit> => {
  const units = new Map();
  grid.data.forEach((value, pos) => {
    if (value === "G" || value === "E") {
      const coords = fromPos(pos);
      units.set(pos, new Unit(Race[value], coords[0], coords[1]));
      grid.data.set(pos, ".");
    }
  });

  return units;
};

const directions = [
  [0, -1], // up
  [0, 1], // down
  [-1, 0], // left
  [1, 0], // right
];

const fromPos = (pos: string): [number, number] => {
  const parts = pos.split(",");
  return [+parts[0], +parts[1]];
};

export const parseGraph = (grid: Grid): Map<string, Array<string>> => {
  const graph = new Map();

  grid.data.forEach((value, pos) => {
    if (value === ".") {
      let neighbours = graph.get(value);
      if (!neighbours) {
        neighbours = new Array();
        graph.set(pos, neighbours);
      }

      const coords = fromPos(pos);
      for (let direction of directions) {
        const neighbourPos = toPos(
          coords[0] + direction[0],
          coords[1] + direction[1]
        );
        const maybe = grid.data.get(neighbourPos);
        if (maybe && maybe === ".") {
          neighbours.push(neighbourPos);
        }
      }
    }
  });

  return graph;
};

export const findPaths = (
  paths: Array<Array<string>>,
  path: Array<string>,
  parent: Map<string, Array<string>>,
  u: string
): void => {
  if (u === "self") {
    paths.push(Object.assign([], path));
    return;
  }

  const parents = parent.get(u) || [];
  for (const p of parents) {
    path.push(u);
    findPaths(paths, path, parent, p);
    path.pop();
  }
};

export const bfs = (
  start: string,
  graph: Map<string, Array<string>>,
  units: Map<string, Unit>
): Map<string, Array<string>> => {
  const dist: Map<string, number> = new Map();
  const queue: Array<string> = [];
  const parent: Map<string, Array<string>> = new Map();

  queue.push(start);
  parent.set(start, ["self"]);
  dist.set(start, 0);

  while (queue.length > 0) {
    const u = queue.shift();
    let neighbours = graph.get(u);

    if (neighbours) {
      // someone is standing in the way
      neighbours = neighbours.filter((n) => units.get(n) === undefined);
      for (const v of neighbours) {
        let neighDist = dist.get(v);
        if (neighDist === undefined) {
          neighDist = Number.MAX_SAFE_INTEGER;
        }
        let cur = dist.get(u);

        let path = parent.get(v);
        if (!path) {
          path = [];
          parent.set(v, path);
        }

        if (neighDist > cur + 1) {
          dist.set(v, cur + 1);
          queue.push(v);

          path.splice(0, path.length); // clear
          path.push(u);
        } else if (neighDist === cur + 1) {
          path.push(u);
        }
      }
    }
  }

  return parent;
};

export const print = (grid: Grid, units: Map<string, Unit>): string[] => {
  const out = [];
  for (let y = 0; y < grid.maxY + 1; y++) {
    let line = [];
    let unitsLine = [];
    for (let x = 0; x < grid.maxX + 1; x++) {
      const pos = toPos(x, y);
      const point = grid.data.get(pos);
      const unit = units.get(pos);

      if (point) {
        line.push(unit ? Race[unit.race] : point);
      }
      if (unit) {
        unitsLine.push(unit.toString());
      }
    }

    out.push(`${line.join("")}   ${unitsLine.join(", ")}`);
  }

  return out;
};

export const getUnitsForRound = (units: Map<string, Unit>): Array<Unit> => {
  const existing: Array<[string, Unit]> = Array.from(units.entries());
  existing.sort((a, b) => {
    const coordA = fromPos(a[0]);
    const coordB = fromPos(b[0]);

    if (coordA[1] > coordB[1]) {
      return 1;
    } else if (coordA[1] < coordB[1]) {
      return -1;
    } else {
      if (coordA[0] > coordB[0]) {
        return 1;
      } else if (coordA[0] < coordB[0]) {
        return -1;
      } else {
        return 0;
      }
    }
  });

  const sortedUnits = [];
  for (const entry of existing) {
    sortedUnits.push(entry[1]);
  }

  return sortedUnits;
};

export const findTargets = (
  unit: Unit,
  units: Map<string, Unit>
): Array<Unit> => {
  const targets = [];

  units.forEach((target, _) => {
    if (target !== unit && target.race != unit.race && target.hp > 0) {
      targets.push(target);
    }
  });

  return targets;
};

export const findOpenSpaces = (
  targets: Array<Unit>,
  grid: Grid,
  units: Map<string, Unit>
): Array<string> => {
  const spaces = [];

  for (const target of targets) {
    for (const direction of directions) {
      const pos = toPos(target.x + direction[0], target.y + direction[1]);
      const value = grid.data.get(pos);
      const unit = units.get(pos);
      if (!unit && value && value === ".") {
        spaces.push(pos);
      }
    }
  }

  return spaces;
};

export const findShortestPaths = (
  start: string,
  end: string,
  graph: Map<string, Array<string>>,
  units: Map<string, Unit>
): Array<Array<string>> => {
  const parent = bfs(start, graph, units);
  const paths: Array<Array<string>> = [];

  findPaths(paths, [], parent, end);
  for (const path of paths) {
    path.reverse();
  }

  return paths;
};

export const findMove = (
  from: string,
  ends: Array<string>,
  graph: Map<string, Array<string>>,
  units: Map<string, Unit>
): string | null => {
  const paths: Array<Array<string>> = [];
  for (const space of ends) {
    for (const path of findShortestPaths(from, space, graph, units)) {
      paths.push(path);
    }
  }

  paths.sort((a, b) => {
    if (a.length < b.length) {
      return -1;
    } else if (a.length > b.length) {
      return 1;
    }

    const coordA = fromPos(a[1]);
    const coordB = fromPos(b[1]);

    if (coordA[1] > coordB[1]) {
      return 1;
    } else if (coordA[1] < coordB[1]) {
      return -1;
    } else {
      if (coordA[0] > coordB[0]) {
        return 1;
      } else if (coordA[0] < coordB[0]) {
        return -1;
      } else {
        return 0;
      }
    }
  });

  return paths.length > 0 ? paths[0][1] : null;
};

export const moveUnit = (
  unit: Unit,
  pos: string,
  units: Map<string, Unit>
): void => {
  units.delete(unit.pos());
  const coord = fromPos(pos);
  unit.x = coord[0];
  unit.y = coord[1];
  units.set(unit.pos(), unit);
};

export const findAdjecentTarget = (
  unit: Unit,
  units: Map<string, Unit>
): Unit | null => {
  /*
  Otherwise, the adjacent target with the fewest hit points is selected; 
  in a tie, the adjacent target with the fewest hit points which is first 
  in reading order is selected.
  */
  const candidates: Array<Unit> = [];

  for (const dir of directions) {
    const pos = toPos(unit.x + dir[0], unit.y + dir[1]);
    const candidate = units.get(pos);
    if (candidate && candidate.race !== unit.race) {
      candidates.push(candidate);
    }
  }

  candidates.sort((a, b) => {
    if (a.hp < b.hp) {
      return -1;
    } else if (a.hp > b.hp) {
      return 1;
    } else {
      if (a.y > b.y) {
        return 1;
      } else if (a.y < b.y) {
        return -1;
      } else {
        if (a.x > b.x) {
          return 1;
        } else if (a.x < b.x) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  });

  return candidates.length > 0 ? candidates[0] : null;
};

export const runCombat = (
  grid: Grid,
  graph: Map<string, Array<string>>,
  units: Map<string, Unit>
) => {
  console.log(`Initially:`);
  console.log(print(grid, units).join("\n"));

  let rounds = 0;
  let done = false;
  while (!done) {
    rounds++;

    /*
    the order in which units take their turns within a round is 
    the reading order of their starting positions in that round
    */
    for (const unit of getUnitsForRound(units)) {
      if (unit.hp < 0) {
        continue;
      }

      /*
      Each unit begins its turn by identifying all possible targets (enemy units).
      If no targets remain, combat ends.
      */
      const targets = findTargets(unit, units);
      if (targets.length == 0) {
        done = true;
        break;
      }

      /*
      Then, the unit identifies all of the open squares (.) that are in range of each target
      */
      const openSpaces = findOpenSpaces(targets, grid, units);

      /*
      To move, the unit first considers the squares that are in range and 
      determines which of those squares it could reach in the fewest steps
      
      If the unit cannot reach (find an open path to) any of the squares that are in range, it ends its turn.
      
      If multiple squares are in range and tied for being reachable in the fewest steps, 
      the square which is first in reading order is chosen

      The unit then takes a single step toward the chosen square along the shortest path
      to that square.
      If multiple steps would put the unit equally closer to its destination, 
      the unit chooses the step which is first in reading order. 
      
      (This requires knowing when there is more than one shortest path so that yo
       can consider the first step of each such path.)
      */
      let target = findAdjecentTarget(unit, units);

      if (!target) {
        const pos = findMove(unit.pos(), openSpaces, graph, units);
        if (pos) {
          moveUnit(unit, pos, units);
          target = findAdjecentTarget(unit, units);
        }
      }

      /*
      To attack, the unit first determines all of the targets that are in range of it by
      being immediately adjacent to it. 
      If there are no such targets, the unit ends its turn.
      */
      if (target) {
        unit.attack(target);
        if (target.hp <= 0) {
          units.delete(target.pos());
        }
      }
    }

    console.log(`After ${rounds} round${rounds > 1 ? "s" : ""}:`);
    console.log(print(grid, units).join("\n"));
  }

  let hitPoints = 0;
  units.forEach((unit, _) => {
    if (unit.hp > 0) {
      hitPoints += unit.hp;
    }
  });

  console.log("rounds: " + (rounds - 1) + " hitPoints: " + hitPoints);

  return (rounds - 1) * hitPoints;
};

const solve1 = (file: string): number => {
  const lines = parse(file);
  const grid = parseGrid(lines);
  const units = extractUnits(grid);
  const graph = parseGraph(grid);

  return 0;
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  return 0;
};

//console.log(solve1("./input.txt"));

// assert(solve2('./example.txt') === 2);
console.log(solve2("./input.txt"));
