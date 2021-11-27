import { strict as assert } from "assert";
import { Edge, findShortestPathWeighted } from "../graph";
import { Grid } from "../grid";

interface Pos {
  x: number;
  y: number;
}

const DEPTH = 5616;
const TARGET: Pos = { x: 10, y: 785 };

const CACHE: Map<string, number> = new Map();

const fromPos = (pos: Pos): string => {
  return `${pos.x},${pos.y}`;
};

const type = (erosionLevel: number): string => {
  switch (erosionLevel % 3) {
    case 0:
      return ".";
    case 1:
      return "=";
    case 2:
      return "|";
    default:
      throw "unexpected type";
  }
};

const erosionLevel = (pos: Pos, target: Pos, depth: number): number => {
  let gi = CACHE.get(fromPos(pos));
  if (!gi) {
    // eslint-disable-next-line no-use-before-define
    gi = geoIndex(pos, target, depth);
    CACHE.set(fromPos(pos), gi);
  }
  return (gi + depth) % 20183;
};

const geoIndex = (pos: Pos, target: Pos, depth: number): number => {
  if (
    (pos.x === 0 && pos.y === 0) ||
    (pos.x === target.x && pos.y === target.y)
  ) {
    return 0;
  }
  if (pos.y === 0) {
    return pos.x * 16807;
  }
  if (pos.x === 0) {
    return pos.y * 48271;
  }

  return (
    erosionLevel({ x: pos.x - 1, y: pos.y }, target, depth) *
    erosionLevel({ x: pos.x, y: pos.y - 1 }, target, depth)
  );
};

const solve1 = (depth: number, target: Pos): number => {
  let riskLevel = 0;
  for (let y = 0; y < target.y + 1; y++) {
    let line = "";
    for (let x = 0; x < target.x + 1; x++) {
      const el = erosionLevel({ x, y }, target, depth);

      if (x === 0 && y === 0) {
        line += "M";
      } else if (x === target.x && y === target.y) {
        line += "T";
      } else {
        line += type(el);
      }
      riskLevel += el % 3;
    }

    console.log(line);
  }

  return riskLevel;
};

const solve2 = (depth: number, target: Pos): number => {
  const lines = [];
  for (let y = 0; y < target.y + 20; y++) {
    let line = "";
    for (let x = 0; x < target.x + 40; x++) {
      const el = erosionLevel({ x, y }, target, depth);
      line += type(el);
    }

    lines.push(line);
  }

  const grid = Grid.parseGrid(lines);

  const graph: Map<string, Array<Edge>> = new Map();
  grid.data.forEach((value, pos) => {
    // make a graph in x, y, z coords.
    // z = 0 => torch (".", "|")
    // z = 1 => climbing (".", "=")
    // z = 2 => neither ("|", "=")

    for (let z = 0; z < 3; z++) {
      const actualPos = `${pos},${z}`;
      let edges = graph.get(actualPos);
      if (!edges) {
        edges = [];
        graph.set(actualPos, edges);
      }

      switch (z) {
        case 0: // torch
          if (value === ".") {
            // switch to climbing if in rocky
            edges.push({ to: `${pos},1`, cost: 7 });
          } else if (value === "|") {
            // switch to neither if in narrow
            edges.push({ to: `${pos},2`, cost: 7 });
          }
          break;
        case 1: // climbing
          if (value === ".") {
            // switch to torch if in rocky
            edges.push({ to: `${pos},0`, cost: 7 });
          } else if (value === "=") {
            // switch to neither if in wet
            edges.push({ to: `${pos},2`, cost: 7 });
          }
          break;
        case 2: // neither
          if (value === "=") {
            // switch to climbing if in wet
            edges.push({ to: `${pos},1`, cost: 7 });
          } else if (value === "|") {
            // switch to torch if in narrow
            edges.push({ to: `${pos},0`, cost: 7 });
          }
          break;
        default:
          throw "unexpected z";
      }
    }

    for (const dir of grid.directions) {
      const p = grid.fromPos(pos);
      const np = [p[0] + dir[0], p[1] + dir[1]];
      const neighbourPos = grid.toPos(np[0], np[1]);
      const neighbour = grid.data.get(neighbourPos);

      if (neighbour) {
        for (let z = 0; z < 3; z++) {
          const actualPos = `${pos},${z}`;
          let edges = graph.get(actualPos);
          if (!edges) {
            edges = [];
            graph.set(actualPos, edges);
          }

          switch (z) {
            case 0: // torch
              if (value === "=") {
                // can't use torch in wet
                break;
              }

              if (neighbour === "|") {
                edges.push({ to: `${neighbourPos},0`, cost: 1 });
              }
              if (neighbour === ".") {
                edges.push({ to: `${neighbourPos},0`, cost: 1 });
              }
              break;
            case 1: // climbing
              if (value === "|") {
                // can't use climbing in narrow
                break;
              }

              if (neighbour === "=") {
                edges.push({ to: `${neighbourPos},1`, cost: 1 });
              }
              if (neighbour === ".") {
                edges.push({ to: `${neighbourPos},1`, cost: 1 });
              }
              break;
            case 2: // neither
              if (value === ".") {
                // can't use neither in rocky
                break;
              }

              if (neighbour === "=") {
                edges.push({ to: `${neighbourPos},2`, cost: 1 });
              }
              if (neighbour === "|") {
                edges.push({ to: `${neighbourPos},2`, cost: 1 });
              }
              break;
            default:
              throw "unexpected z";
          }
        }
      }
    }
  });

  const result = findShortestPathWeighted(
    graph,
    "0,0,0",
    `${target.x},${target.y},0`
  );

  return result.distance;
};

const pos = { x: 0, y: 0 };
const target = { x: 10, y: 100 };
const depth = 510;

let gi = geoIndex(pos, target, depth);
assert(gi === 0);
let el = erosionLevel(pos, target, depth);
assert(el === depth);
assert(type(el) === ".");

pos.x = 1;
gi = geoIndex(pos, target, depth);
assert(gi === 16807);
el = erosionLevel(pos, target, depth);
assert(el === 17317);
assert(type(el) === "=");

pos.x = 0;
pos.y = 1;
gi = geoIndex(pos, target, depth);
assert(gi === 48271);
el = erosionLevel(pos, target, depth);
assert(el === 8415);
assert(type(el) === ".");

pos.x = 1;
gi = geoIndex(pos, target, depth);
assert(gi === 145722555);
el = erosionLevel(pos, target, depth);
assert(el === 1805);
assert(type(el) === "|");

assert(solve1(510, { x: 10, y: 10 }) === 114);
CACHE.clear();

console.log("");
console.log(solve1(DEPTH, TARGET));

CACHE.clear();
assert(solve2(510, { x: 10, y: 10 }) === 45);

CACHE.clear();
console.log(solve2(DEPTH, TARGET));
