import { strict as assert } from 'assert';
import LinkedList from 'ts-linked-list';

const solve1 = (numPlayers: number, maxValue: number): number => {
  const players: Array<number> = new Array(numPlayers);
  for (let p = 0; p < numPlayers; p++) {
    players[p] = 0;
  }

  const ring = new LinkedList<number>();
  ring.append(0);

  let cur = ring.head;
  for (let m = 1; m < maxValue + 1; m++) {
    cur = cur!.next;
    if (!cur) {
      cur = ring.head;
    }

    if (m % 23 === 0) {
      let nextCur = cur;

      for (let i = 0; i < 8; i++) {
        if (!nextCur) {
          nextCur = ring.tail;
        }
        nextCur = nextCur!.prev;
      }

      players[m % numPlayers] += m;
      cur = nextCur!.next;

      players[m % numPlayers] += nextCur!.data;
      nextCur!.remove();
    } else {
      cur!.insertAfter(m);
      cur = cur!.next;
      if (!cur) {
        cur = ring.head;
      }
    }

    /* let logCur: LinkedListNode | null = ring.head;
    let logBuf = '[' + m + '] ';
    while (logCur) {
      if (logCur === cur) {
        logBuf += '(';
      }
      logBuf += logCur.data;
      if (logCur === cur) {
        logBuf += ')';
      }

      logBuf += ' ';
      logCur = logCur.next;
    }
    console.log(logBuf); */
  }

  return players.reduce((a, b) => (a > b ? a : b));
};

assert(solve1(9, 25) === 32);
/*
10 players; last marble is worth 1618 points: high score is 8317
13 players; last marble is worth 7999 points: high score is 146373
17 players; last marble is worth 1104 points: high score is 2764
21 players; last marble is worth 6111 points: high score is 54718
30 players; last marble is worth 5807 points: high score is 37305
*/
assert(solve1(10, 1618) === 8317);
assert(solve1(13, 7999) === 146373);
assert(solve1(17, 1104) === 2764);
assert(solve1(21, 6111) === 54718);
assert(solve1(30, 5807) === 37305);

console.log(solve1(427, 70723));
console.log(solve1(427, 7072300));
