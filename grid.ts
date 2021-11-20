/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
class Grid<T> {
  data: Map<string, T>;

  maxX: number;

  maxY: number;

  directions = [
    [0, -1], // up
    [0, 1], // down
    [-1, 0], // left
    [1, 0], // right
  ];

  adjecent: Array<[number, number]> = [
    [-1, 0], // left
    [1, 0], // right

    [1, -1], // bottom right
    [0, -1], // bottom middle
    [-1, -1], // bottom left

    [1, 1], // top right
    [0, 1], // top middle
    [-1, 1], // top left
  ];

  constructor(data: Map<string, T>, maxX: number, maxY: number) {
    this.data = data;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  static parseGrid = (lines: string[]): Grid<string> => {
    const data: Map<string, string> = new Map();
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        data.set(Grid.toPos(x, y), lines[y][x]);

        if (maxX < x) {
          maxX = x;
        }
        if (maxY < y) {
          maxY = y;
        }
      }
    }

    return new Grid(data, maxX, maxY);
  };

  static toPos = (x: number, y: number): string => {
    return `${x},${y}`;
  };

  toPos = (x: number, y: number): string => {
    return Grid.toPos(x, y);
  };

  static fromPos = (pos: string): [number, number] => {
    const parts = pos.split(",");
    return [+parts[0], +parts[1]];
  };

  fromPos = (pos: string): [number, number] => {
    return Grid.fromPos(pos);
  };

  print = (): string[] => {
    const out = [];
    for (let y = 0; y < this.maxY + 1; y++) {
      const line = [];
      for (let x = 0; x < this.maxX + 1; x++) {
        const pos = Grid.toPos(x, y);
        const point = this.data.get(pos);

        if (point) {
          line.push(point);
        }
      }

      out.push(`${line.join("")}`);
    }

    return out;
  };

  getAdjecent = (x: number, y: number): Array<string> => {
    const neighbours = [];

    for (const offset of this.adjecent) {
      const chr = this.data.get(Grid.toPos(x + offset[0], y + offset[1]));
      if (chr) {
        neighbours.push(chr);
      }
    }

    return neighbours;
  };
}

export { Grid };
