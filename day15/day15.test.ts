import "jest";
import {
  extractUnits,
  findAdjecentTarget,
  findMove,
  findOpenSpaces,
  findShortestPaths,
  findTargets,
  getUnitsForRound,
  moveUnit,
  parseGraph,
  parseGrid,
  print,
  Race,
  runCombat,
  Unit,
} from "./day15";

const movement = `
#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########
`;

describe("Unit", () => {
  it("should attack", async () => {
    const elf = new Unit(Race.E, 0, 0);
    const goblin = new Unit(Race.G, 0, 1);
    elf.attack(goblin);
    elf.attack(goblin);
    goblin.attack(elf);

    expect(elf.hp).toBe(197);
    expect(goblin.hp).toBe(194);
  });
});

const pathsExample = `
#######
#.E...#
#.....#
#...G.#
#######
`;

describe("Grid", () => {
  it("should parse grid", async () => {
    const grid = parseGrid(movement.trim().split("\n"));

    expect(grid.maxX).toBe(8);
    expect(grid.maxY).toBe(8);

    expect(grid.data.get("1,1")).toBe("G");
    expect(grid.data.get("4,4")).toBe("E");
    expect(grid.data.get("1,3")).toBe(".");
    expect(grid.data.get("0,0")).toBe("#");
  });

  it("should extract units", async () => {
    const grid = parseGrid(movement.trim().split("\n"));
    const units = extractUnits(grid);

    expect(Array.from(units.values()).length).toBe(9);

    expect(units.get("1,1").race).toBe(Race.G);
    expect(units.get("4,4").race).toBe(Race.E);

    expect(grid.data.get("1,1")).toBe(".");
    expect(grid.data.get("4,4")).toBe(".");
    expect(grid.data.get("1,3")).toBe(".");
    expect(grid.data.get("0,0")).toBe("#");
  });

  it("should parse graph", async () => {
    const grid = parseGrid(movement.trim().split("\n"));
    const _ = extractUnits(grid);
    const graph = parseGraph(grid);

    expect(graph.get("0,0")).toBeUndefined();

    expect(graph.get("1,1")[0]).toBe("1,2");
    expect(graph.get("1,1")[1]).toBe("2,1");

    expect(graph.get("4,4")[0]).toBe("4,3");
    expect(graph.get("4,4")[1]).toBe("4,5");
    expect(graph.get("4,4")[2]).toBe("3,4");
    expect(graph.get("4,4")[3]).toBe("5,4");
  });

  it("should findShortestPaths", async () => {
    const grid = parseGrid(pathsExample.trim().split("\n"));
    const units = extractUnits(grid);
    const graph = parseGraph(grid);

    const paths = findShortestPaths("2,1", "4,2", graph, units);
    expect(paths[0]).toEqual(["2,1", "2,2", "3,2", "4,2"]);
    expect(paths[1]).toEqual(["2,1", "3,1", "3,2", "4,2"]);
    expect(paths[2]).toEqual(["2,1", "3,1", "4,1", "4,2"]);
  });
});

const movementPrinted = `#########   
#G..G..G#   G(200), G(200), G(200)
#.......#   
#.......#   
#G..E..G#   G(200), E(200), G(200)
#.......#   
#.......#   
#G..G..G#   G(200), G(200), G(200)
#########   `;

const example = `
#######
#E..G.#
#...#.#
#.G.#G#
#######
`;

const exampleMultipleShortest = `
#######
#.E...#
#.....#
#...G.#
#######
`;

const exampleAdjecent = `
#######
#E.G..#
#.GEG.#
#..E..#
#######
`;

describe("Solve", () => {
  it("should print", async () => {
    const grid = parseGrid(movement.trim().split("\n"));
    const units = extractUnits(grid);

    const lines = print(grid, units);

    expect(lines.join("\n")).toEqual(movementPrinted);
  });

  it("should getUnitsForRound", async () => {
    const grid = parseGrid(movement.trim().split("\n"));
    const units = extractUnits(grid);

    const unitForRound = getUnitsForRound(units);
    expect(unitForRound[0].x).toBe(1);
    expect(unitForRound[0].y).toBe(1);
    expect(unitForRound[4].x).toBe(4);
    expect(unitForRound[4].x).toBe(4);
    expect(unitForRound[8].x).toBe(7);
    expect(unitForRound[8].x).toBe(7);
  });

  it("should findTargets", async () => {
    const grid = parseGrid(example.trim().split("\n"));
    const units = extractUnits(grid);

    const targetLists = [];
    units.forEach((unit, _) => {
      targetLists.push(findTargets(unit, units));
    });

    expect(targetLists.length).toBe(4);

    expect(targetLists[0].length).toBe(3);
    expect(targetLists[0][0].race).toBe(Race.G);
    expect(targetLists[0][1].race).toBe(Race.G);
    expect(targetLists[0][2].race).toBe(Race.G);

    expect(targetLists[0][0] === targetLists[0][1]).toBeFalsy();
    expect(targetLists[0][1] === targetLists[0][2]).toBeFalsy();

    expect(targetLists[1].length).toBe(1);
    expect(targetLists[1][0].race).toBe(Race.E);
    expect(targetLists[2].length).toBe(1);
    expect(targetLists[3].length).toBe(1);

    expect(targetLists[1][0]).toEqual(targetLists[2][0]);
    expect(targetLists[2][0]).toEqual(targetLists[3][0]);
  });

  it("should findOpenSpaces", async () => {
    const grid = parseGrid(example.trim().split("\n"));
    const units = extractUnits(grid);

    const targetLists = [];
    units.forEach((unit, _) => {
      targetLists.push(findTargets(unit, units));
    });

    const openSpaces = findOpenSpaces(targetLists[0], grid, units);
    expect(openSpaces.length).toBe(6);
    expect(openSpaces[0]).toBe("3,1");
    expect(openSpaces[1]).toBe("5,1");
    expect(openSpaces[2]).toBe("2,2");
    expect(openSpaces[3]).toBe("1,3");
    expect(openSpaces[4]).toBe("3,3");
    expect(openSpaces[5]).toBe("5,2");
  });

  it("should findMove", async () => {
    const grid = parseGrid(example.trim().split("\n"));
    const units = extractUnits(grid);
    const graph = parseGraph(grid);
    const targetLists = [];
    units.forEach((unit, _) => {
      targetLists.push(findTargets(unit, units));
    });

    const openSpaces = findOpenSpaces(targetLists[0], grid, units);

    const pos = findMove("1,1", openSpaces, graph, units);
    expect(pos).toEqual("2,1");
  });

  it("should findMove", async () => {
    const grid = parseGrid(exampleMultipleShortest.trim().split("\n"));
    const units = extractUnits(grid);
    const graph = parseGraph(grid);
    const targetLists = [];
    units.forEach((unit, _) => {
      targetLists.push(findTargets(unit, units));
    });

    const openSpaces = findOpenSpaces(targetLists[0], grid, units);

    const pos = findMove("2,1", openSpaces, graph, units);
    expect(pos).toEqual("3,1");
  });

  it("should moveUnit", async () => {
    const grid = parseGrid(example.trim().split("\n"));
    const units = extractUnits(grid);

    moveUnit(units.get("1,1"), "2,1", units);

    expect(units.get("1,1")).toBeUndefined();
    const unit = units.get("2,1");
    expect(unit.x).toBe(2);
    expect(unit.y).toBe(1);
  });

  it("should findAdjecentTarget", async () => {
    const grid = parseGrid(exampleAdjecent.trim().split("\n"));
    const units = extractUnits(grid);
    units.get("4,2").hp = 100;
    units.get("3,3").hp = 90;

    const target = findAdjecentTarget(units.get("3,2"), units);
    expect(target.pos()).toEqual("4,2");
    expect(target.hp).toEqual(100);

    expect(findAdjecentTarget(units.get("1,1"), units)).toBeNull();
  });
});

const example1 = `
#######   
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######
`;

describe("Combat", () => {
  it("should runCombat(example1)", async () => {
    const grid = parseGrid(example1.trim().split("\n"));
    const units = extractUnits(grid);
    const graph = parseGraph(grid);

    const score = runCombat(grid, graph, units);
    expect(score).toEqual(27730);
  });
});
