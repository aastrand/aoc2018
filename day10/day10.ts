import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const parsePoints = (lines: string[]): Point[] => {
  const points = [];

  for (const line of lines) {
    const base = line.split("> velocity=<");
    const x = +base[0].split(",")[0].split("position=<")[1];
    const y = +base[0].split(",")[1];
    const dx = +base[1].split(",")[0];
    const dy = +base[1].split(",")[1].slice(0, -1);
    points.push({
      x,
      y,
      dx,
      dy,
    });
  }

  return points;
};

const solve1 = (file: string): void => {
  const points = parsePoints(parse(file));

  let maxX = 0;
  let maxY = 0;
  let minX = 0;
  let minY = 0;
  let oldMaxX = Number.MAX_SAFE_INTEGER;
  let oldMaxY = Number.MAX_SAFE_INTEGER;

  let done = false;
  let counter = 0;
  while (!done) {
    maxX = 0;
    maxY = 0;
    minX = Number.MAX_SAFE_INTEGER;
    minY = Number.MAX_SAFE_INTEGER;

    for (const point of points) {
      point.x += point.dx;
      if (point.x > maxX) {
        maxX = point.x;
      }
      if (point.x < minX) {
        minX = point.x;
      }

      point.y += point.dy;
      if (point.y > maxY) {
        maxY = point.y;
      }
      if (point.y < minY) {
        minY = point.y;
      }
    }

    // roll back
    if (oldMaxX < maxX || oldMaxY < maxY) {
      for (const point of points) {
        point.x -= point.dx;
        point.y -= point.dy;
      }
      done = true;
    }

    oldMaxX = maxX;
    oldMaxY = maxY;
    counter++;
  }

  const grid: Map<string, Point> = new Map();
  for (const point of points) {
    grid.set(`${point.x}, ${point.y}`, point);
  }

  for (let y = minY - 1; y < maxY + 1; y++) {
    let lineBuffer = "";
    for (let x = minX - 1; x < maxX + 1; x++) {
      const point = grid.get(`${x}, ${y}`);
      lineBuffer += point ? "#" : ".";
    }
    console.log(lineBuffer);
  }
  console.log(`appeared after ${counter - 1} seconds`);
};

solve1("./example.txt");
solve1("./input.txt");
