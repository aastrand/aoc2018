import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Box {
  twos: number;
  threes: number;
}

const parseBox = (input: string): Box => {
  const seen = new Map();

  for (const chr of input.trim().split("")) {
    if (!seen.has(chr)) {
      seen.set(chr, 0);
    }

    seen.set(chr, seen.get(chr) + 1);
  }

  let twos = 0;
  let threes = 0;
  for (const key of seen.keys()) {
    if (seen.get(key) === 2) {
      twos += 1;
    } else if (seen.get(key) === 3) {
      threes += 1;
    }
  }

  return { twos, threes };
};

const solve1 = (file: string): number => {
  const lines = parse(file);

  let twos = 0;
  let threes = 0;
  for (const line of lines) {
    const box = parseBox(line);
    twos += box.twos > 0 ? 1 : 0;
    threes += box.threes > 0 ? 1 : 0;
  }

  return twos * threes;
};

// from https://gist.github.com/keesey/e09d0af833476385b9ee13b6d26a2b84
const levenshtein = (a: string, b: string): number => {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    // eslint-disable-next-line no-multi-assign
    const row = (matrix[i] = new Array<number>(an + 1));
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1],
            matrix[i][j - 1],
            matrix[i - 1][j] // deletion
          ) + 1;
      }
    }
  }
  return matrix[bn][an];
};

interface MostCommon {
  line1: string;
  line2: string;
  distance: number;
}

const solve2 = (file: string): number => {
  const lines = parse(file);

  let least: MostCommon = { line1: "", line2: "", distance: 27 };
  for (const line1 of lines) {
    for (const line2 of lines) {
      const distance = levenshtein(line1, line2);
      if (distance > 0 && distance < least.distance) {
        least = { line1, line2, distance };
      }
    }
  }

  console.log(least);

  return 0;
};

assert(solve1("./example.txt") === 12);
console.log(solve1("./input.txt"));

// assert(solve2("./example2.txt") === 2);
console.log(solve2("./input.txt"));
