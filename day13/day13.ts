import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").split("\n");

const coord = (x: number, y: number): string => {
  return `${x},${y}`;
};

const split = (coord: string): [number, number] => {
  const split = coord.split(",");
  return [+split[0], +split[1]];
};

const makeGrid = (lines: string[]): Map<string, string> => {
  const grid = new Map();
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      const char = lines[y][x];
      if (char !== " ") {
        grid.set(coord(x, y), char);
      }
    }
  }

  return grid;
};

enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

interface Car {
  id: number;
  x: number;
  y: number;
  dir: Direction;
  turns: number;
  dead: boolean;
}

const makeCars = (grid: Map<string, string>) => {
  let cars: Array<Car> = [];

  let id = 0;
  grid.forEach((value, key) => {
    const parts = split(key);
    switch (value) {
      case "^":
        cars.push({
          id: id++,
          x: parts[0],
          y: parts[1],
          dir: Direction.Up,
          turns: 0,
          dead: false,
        });
        break;
      case "v":
        cars.push({
          id: id++,
          x: parts[0],
          y: parts[1],
          dir: Direction.Down,
          turns: 0,
          dead: false,
        });
        break;
      case ">":
        cars.push({
          id: id++,
          x: parts[0],
          y: parts[1],
          dir: Direction.Right,
          turns: 0,
          dead: false,
        });
        break;
      case "<":
        cars.push({
          id: id++,
          x: parts[0],
          y: parts[1],
          dir: Direction.Left,
          turns: 0,
          dead: false,
        });
        break;
      default:
        break;
    }
  });

  return cars;
};

const makeOffset = (dir: Direction): [number, number] => {
  switch (dir) {
    case Direction.Up:
      return [0, -1];
      break;
    case Direction.Down:
      return [0, 1];
      break;
    case Direction.Left:
      return [-1, 0];
      break;
    case Direction.Right:
      return [1, 0];
      break;
    default:
      throw `unexpected enum value: ${dir}`;
      break;
  }
};

const newDirection = (nextChar: string, car: Car): Direction | null => {
  let newDir: Direction | null = null;
  switch (nextChar) {
    case "\\":
      if (car.dir === Direction.Up) {
        newDir = Direction.Left;
      } else if (car.dir === Direction.Down) {
        newDir = Direction.Right;
      } else if (car.dir === Direction.Right) {
        newDir = Direction.Down;
      } else if (car.dir === Direction.Left) {
        newDir = Direction.Up;
      }

      break;
    case "/":
      if (car.dir === Direction.Up) {
        newDir = Direction.Right;
      } else if (car.dir === Direction.Down) {
        newDir = Direction.Left;
      } else if (car.dir === Direction.Right) {
        newDir = Direction.Up;
      } else if (car.dir === Direction.Left) {
        newDir = Direction.Down;
      }

      break;
    case "+":
      if (car.turns % 3 == 0) {
        // it turns left the first time
        if (car.dir === Direction.Up) {
          newDir = Direction.Left;
        } else if (car.dir === Direction.Down) {
          newDir = Direction.Right;
        } else if (car.dir === Direction.Right) {
          newDir = Direction.Up;
        } else if (car.dir === Direction.Left) {
          newDir = Direction.Down;
        }
      } else if (car.turns % 3 == 1) {
        // goes straight the second time
      } else if (car.turns % 3 == 2) {
        // turns right the third time
        if (car.dir === Direction.Up) {
          newDir = Direction.Right;
        } else if (car.dir === Direction.Down) {
          newDir = Direction.Left;
        } else if (car.dir === Direction.Right) {
          newDir = Direction.Down;
        } else if (car.dir === Direction.Left) {
          newDir = Direction.Up;
        }
      }
      // and then repeats those directions starting againn

      car.turns = (car.turns + 1) % 3;
      break;
    default:
      break;
  }

  return newDir;
};

const collisions = (cars: Array<Car>): string | null => {
  let positions = new Map();

  for (const car of cars) {
    const pos = coord(car.x, car.y);
    const other = positions.get(pos);
    if (other) {
      car.dead = true;
      other.dead = true;

      return pos;
    }

    positions.set(pos, car);
  }

  return null;
};

const run = (
  grid: Map<string, string>,
  cars: Array<Car>,
  remove: boolean
): string => {
  let collisionPos: string | null = null;
  while (!collisionPos) {
    cars.sort((a, b) => {
      if (a.y < b.y) {
        return -1;
      } else if (a.y > b.y) {
        return 1;
      } else {
        if (a.x < b.x) {
          return -1;
        } else if (a.x > b.x) {
          return 1;
        } else {
          return 0;
        }
      }
    });

    for (const car of cars) {
      if (remove && car.dead) {
        continue;
      }

      const offset = makeOffset(car.dir);
      const nextChar = grid.get(coord(car.x + offset[0], car.y + offset[1]));

      if (!nextChar) {
        throw "unexpected null in grid";
      }

      const newDir = newDirection(nextChar, car);

      if (newDir) {
        car.dir = newDir;
      }
      car.x += offset[0];
      car.y += offset[1];

      if (!remove) {
        collisionPos = collisions(cars);
        if (collisionPos) {
          break;
        }
      } else {
        const aliveCars = cars.filter((c) => !c.dead);
        collisionPos = collisions(aliveCars);

        if (aliveCars.length > 2) {
          collisionPos = null;
        }
      }
    }

    const aliveCars = cars.filter((c) => !c.dead);
    if (aliveCars.length === 1) {
      collisionPos = coord(aliveCars[0].x, aliveCars[0].y);
    }
  }

  return collisionPos;
};

const solve1 = (file: string): string => {
  const grid = makeGrid(parse(file));
  const cars = makeCars(grid);

  return run(grid, cars, false);
};

const solve2 = (file: string): string => {
  const grid = makeGrid(parse(file));
  const cars = makeCars(grid);

  return run(grid, cars, true);
};

assert(solve1("./example.txt") === "7,3");
console.log(solve1("./input.txt"));

// assert(solve2('./example.txt') === 2);
console.log(solve2("./input.txt"));
