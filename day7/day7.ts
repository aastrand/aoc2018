import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const buildGraph = (
  lines: string[]
): [Map<string, Array<string>>, Map<string, Array<string>>] => {
  const graph: Map<string, Array<string>> = new Map();
  const reverse: Map<string, Array<string>> = new Map();
  for (const line of lines) {
    const parts = line.split(" must be finished before step ");
    const from = parts[0].split("Step ")[1];
    const to = parts[1].split(" can begin.")[0];

    let children = graph.get(from);
    if (!children) {
      children = [];
      graph.set(from, children);
    }
    children.push(to);

    let parents = reverse.get(to);
    if (!parents) {
      parents = [];
      reverse.set(to, parents);
    }
    parents.push(from);
  }

  return [graph, reverse];
};

const findStartEnd = (
  graph: Map<string, Array<string>>
): [string[], string] => {
  const values: Array<string> = [];
  for (const children of graph.values()) {
    for (const child of children) {
      values.push(child);
    }
  }
  const keys = Array.from(graph.keys());
  const start = keys.filter((x) => !values.includes(x));
  const end = values.filter((x) => !keys.includes(x))[0];

  return [start, end];
};

const solve1 = (file: string): string => {
  const graphs = buildGraph(parse(file));
  const graph = graphs[0];
  const before = graphs[1];
  const ends = findStartEnd(graph);

  const visited: Array<string> = [];
  const queue = ends[0];
  while (queue.length > 0) {
    queue.sort((a, b) => (a < b ? -1 : 1));

    let cur: string;
    while (true) {
      cur = queue.shift() || "";
      const parents = before.get(cur) || [];
      let ready = true;
      for (const parent of parents) {
        if (!visited.includes(parent)) {
          ready = false;
        }
      }

      if (!ready) {
        queue.push(cur);
      } else {
        break;
      }
    }

    visited.push(cur);

    for (const child of graph.get(cur) || []) {
      if (
        !visited.includes(child) &&
        !queue.includes(child) &&
        child !== ends[1]
      ) {
        queue.push(child);
      }
    }
  }

  visited.push(ends[1]);

  return visited.join("");
};

const endTime = (
  clock: number,
  timeToComplete: number,
  job: string
): number => {
  const time = clock + timeToComplete + job.charCodeAt(0) - 64;
  return time;
};

const inProgress = (child: string, workers: [string, number][]): boolean => {
  let status = false;
  for (const w of workers) {
    if (w[0] === child) {
      status = true;
    }
  }

  return status;
};

const solve2 = (
  file: string,
  timeToComplete: number,
  numWorkers: number
): number => {
  const graphs = buildGraph(parse(file));
  const graph = graphs[0];
  const before = graphs[1];

  const ends = findStartEnd(graph);

  const visited: Array<string> = [];
  let workers: Array<[string, number]> = [];

  let queue = ends[0];
  let clock = 0;
  let done = false;

  while (!done) {
    queue.sort((a, b) => (a < b ? -1 : 1));

    const added: Array<string> = [];
    for (const candidate of queue) {
      const parents = before.get(candidate) || [];

      let ready = true;
      for (const parent of parents) {
        if (!visited.includes(parent)) {
          ready = false;
          break;
        }
      }

      if (ready && workers.length < numWorkers) {
        workers.push([candidate, endTime(clock, timeToComplete, candidate)]);
        added.push(candidate);
      }
    }

    queue = queue.filter((x) => !added.includes(x));

    /* let logString = `${clock} `;
    for (let i = 0; i < numWorkers; i++) {
      if (workers.length > i) {
        logString += `${workers[i][0]} `;
      } else {
        logString += '. ';
      }
    }
    logString += visited.join('');
    console.log(logString); */

    if (workers.length === 0) {
      done = true;
    }

    clock++;

    const newWorkers = [];
    for (const worker of workers) {
      if (clock >= worker[1]) {
        visited.push(worker[0]);
        for (const child of graph.get(worker[0]) || []) {
          if (
            !visited.includes(child) &&
            !queue.includes(child) &&
            child !== ends[1]
          ) {
            if (!inProgress(child, workers)) {
              queue.push(child);
            }
          }
        }
      } else {
        newWorkers.push(worker);
      }
    }

    workers = newWorkers;
  }

  visited.push(ends[1]);
  return endTime(clock, timeToComplete, ends[1]) - 1;
};

assert(solve1("./example.txt") === "CABDFE");
console.log(solve1("../input/2018/day7.txt"));

assert(solve2("./example.txt", 0, 2) === 15);
console.log(solve2("../input/2018/day7.txt", 60, 5));
