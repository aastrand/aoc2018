import PriorityQueue from "ts-priority-queue";
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

interface Edge {
  to: string;
  cost: number;
}

const dijkstra = (
  graph: Map<string, Array<Edge>>,
  startNode: string,
  finishNode?: string
) => {
  const parents: Record<string, string> = Object.create(null);
  const costs: Record<string, number> = Object.create(null);
  const explored: Record<string, boolean> = Object.create(null);
  const prioQueue = new PriorityQueue<Edge>({
    comparator: (a: Edge, b: Edge) => a.cost - b.cost,
  });
  prioQueue.queue({ to: startNode, cost: 0 });

  do {
    const node = prioQueue.dequeue().to;
    const cost = costs[node] || 0;

    explored[node] = true;

    if (undefined !== finishNode && node === finishNode) break;

    const edges = graph.get(node) || [];
    for (let i = 0; i < edges.length; i++) {
      const childNode = edges[i].to;
      const alt = cost + edges[i].cost;

      if (undefined === costs[childNode] || alt < costs[childNode]) {
        costs[childNode] = alt;
        parents[childNode] = node;

        if (!explored[childNode]) {
          prioQueue.queue({ to: childNode, cost: alt });
        }
      }
    }
  } while (prioQueue.length !== 0);

  return {
    costs,
    parents,
  };
};

const findShortestPathWeighted = (
  graph: Map<string, Array<Edge>>,
  startNode: string,
  finishNode: string
) => {
  const { costs, parents } = dijkstra(graph, startNode, finishNode);

  const optimalPath = [finishNode];
  let parent = parents[finishNode];
  while (parent !== startNode) {
    optimalPath.push(parent);
    parent = parents[parent];
  }
  optimalPath.reverse();

  const results = {
    distance: costs[finishNode],
    path: optimalPath,
  };

  return results;
};
export { bfs, Edge, findShortestPathWeighted, parseGraph };
