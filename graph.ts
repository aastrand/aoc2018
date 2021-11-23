import { Grid } from "./grid";

const parseGraph = (
  grid: Grid<string>,
  values?: Set<string>
): Map<string, Array<string>> => {
  const graph = new Map();
  if (!values) {
    // eslint-disable-next-line no-param-reassign
    values = new Set(".");
  }

  grid.data.forEach((value, pos) => {
    if (values.has(value)) {
      let neighbours = graph.get(value);
      if (!neighbours) {
        neighbours = [];
        graph.set(pos, neighbours);
      }

      const coords = grid.fromPos(pos);
      for (const direction of grid.directions) {
        const neighbourPos = grid.toPos(
          coords[0] + direction[0],
          coords[1] + direction[1]
        );
        const maybe = grid.data.get(neighbourPos);
        if (values.has(maybe)) {
          neighbours.push(neighbourPos);
        }
      }
    }
  });

  return graph;
};

const bfs = (
  start: string,
  graph: Map<string, Array<string>>,
  filter?: (n: string) => boolean
): Map<string, Array<string>> => {
  const dist: Map<string, number> = new Map();
  const queue: Array<string> = [];
  const parent: Map<string, Array<string>> = new Map();

  queue.push(start);
  dist.set(start, 0);

  while (queue.length > 0) {
    const u = queue.shift();
    let neighbours = graph.get(u);

    if (neighbours) {
      if (filter) {
        neighbours = neighbours.filter((n) => filter(n));
      }

      for (const v of neighbours) {
        let neighDist = dist.get(v);
        if (neighDist === undefined) {
          neighDist = Number.MAX_SAFE_INTEGER;
        }
        const cur = dist.get(u);

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

export { bfs, parseGraph };
