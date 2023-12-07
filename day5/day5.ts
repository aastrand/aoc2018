import { strict as assert } from "assert";
import { readFileSync } from "fs";
import LinkedList from "ts-linked-list";

const CAPITAL_DIFF = 32;

const makeList = (line: string): LinkedList<number> => {
  const list = new LinkedList();
  for (const chr of line.split("")) {
    list.append(chr.charCodeAt(0));
  }

  return list;
};

const fullyReact = (list: LinkedList<number>): LinkedList<number> => {
  let modified = false;
  let cur = list.head;
  do {
    if (!cur || !cur.data || !cur.next || !cur.next.data) {
      throw "unexpected null in list";
    }

    if (Math.abs(cur.data - cur.next.data) === CAPITAL_DIFF) {
      const newCur = cur.next.next;

      cur.next.remove();
      cur.remove();

      cur = newCur;
      modified = true;
    } else {
      cur = cur.next;
    }

    if (!cur || !cur.next) {
      cur = list.head;
      if (!modified) {
        break;
      }
      modified = false;
    }
  } while (true);

  return list;
};

const solve1 = (file: string): number =>
  fullyReact(makeList(readFileSync(file, "utf-8").trim())).length;

const solve2 = (file: string): number => {
  const line: string = readFileSync(file, "utf-8").trim();

  let minLength = line.length;
  // A - Z
  for (let i = 65; i < 91; i++) {
    const list = makeList(line);
    let cur = list.head;
    while (cur !== null) {
      const newCur = cur.next;
      if (cur.data === i || cur.data - CAPITAL_DIFF === i) {
        cur.remove();
      }
      cur = newCur;
    }

    // console.log(list.map((a) => String.fromCharCode(a)).toArray().join(''));
    const reacted = fullyReact(list);
    if (minLength > reacted.length) {
      minLength = reacted.length;
    }
  }

  return minLength;
};

assert(solve1("./example.txt") === 10);
console.log(solve1("../input/2018/day5.txt"));

assert(solve2("./example.txt") === 4);
console.log(solve2("../input/2018/day5.txt"));
