import { strict as assert } from "assert";
import { readFileSync } from "fs";

function parse(file: string): string[] {
  return readFileSync(file, "utf-8").trim().split("\n");
}

interface LogLine {
  date: Date;
  log: string;
}

const parseLog = (lines: string[]): Array<LogLine> => {
  const logs: Array<LogLine> = [];
  for (const line of lines) {
    const timeRegex = /^\[([0-9-: ]+)\] .*$/gm;
    const match = timeRegex.exec(line);
    if (match !== null) {
      const parts = match[1].split(" ");
      logs.push({
        date: new Date(`${parts[0]}T${parts[1]}:00`),
        log: line.split("] ")[1],
      });
    } else {
      throw `Illegal log line: ${line}`;
    }
  }

  logs.sort((a, b) => a.date.getTime() - b.date.getTime());

  return logs;
};

const getGuardToMinutes = (
  logs: Array<LogLine>
): Map<string, Array<number>> => {
  const guardToMinutes: Map<string, Array<number>> = new Map();
  let guard: string | undefined;
  let asleep: Date | undefined | null;

  for (let i = 0; i < logs.length; i++) {
    if (logs[i].log.includes("Guard")) {
      guard = logs[i].log.split(" begins")[0];
      asleep = null;
    } else if (logs[i].log.includes("asleep")) {
      asleep = logs[i].date;
    } else if (logs[i].log.includes("wakes")) {
      if (asleep === undefined) {
        throw `wake up before asleep: ${logs[i].date} ${logs[i].log}`;
      }

      const minutes =
        logs[i].date.getMinutes() - (asleep ? asleep.getMinutes() : 0);
      for (let dm = 0; dm < minutes; dm++) {
        if (!guard) {
          throw `wake up without guard ${logs[i].log}`;
        }
        if (!asleep) {
          throw `wake up without asleep${logs[i].log}`;
        }

        let guardMinutes = guardToMinutes.get(guard);
        if (!guardMinutes) {
          guardMinutes = [];
          guardToMinutes.set(guard, guardMinutes);
        }

        guardMinutes.push(asleep.getMinutes() + dm);
      }

      asleep = null;
    } else {
      throw `Illegal log line: ${logs[i].log}`;
    }
  }

  return guardToMinutes;
};

const solve1 = (file: string): number => {
  const logs: Array<LogLine> = parseLog(parse(file));
  const guardToMinutes: Map<string, Array<number>> = getGuardToMinutes(logs);

  let max = 0;
  let maxGuard: string | undefined;
  for (const g of guardToMinutes.keys()) {
    const minutes = guardToMinutes.get(g);
    if (minutes && minutes.length > max) {
      max = minutes.length;
      maxGuard = g;
    }
  }

  if (!maxGuard) {
    throw "Most sleeping guard not found!";
  }

  const minuteCount: Map<number, number> = new Map();
  const maxGuardMinutes = guardToMinutes.get(maxGuard || "");
  for (const min of maxGuardMinutes || []) {
    let count = minuteCount.get(min);
    if (!count) {
      count = 0;
    }
    minuteCount.set(min, count + 1);
  }

  let maxMin = 0;
  let maxCount = 0;
  for (const min of minuteCount.keys()) {
    const count = minuteCount.get(min) || 0;
    if (count > maxCount) {
      maxCount = count;
      maxMin = min;
    }
  }

  return +maxGuard.split("#")[1] * maxMin;
};

const solve2 = (file: string): number => {
  const logs: Array<LogLine> = parseLog(parse(file));
  const guardToMinutes: Map<string, Array<number>> = getGuardToMinutes(logs);

  let maxFreq = 0;
  let maxMin = 0;
  let maxGuard: string | undefined;
  const guardToFreq: Map<string, Map<number, number>> = new Map();

  for (const guard of guardToMinutes.keys()) {
    let freqMap = guardToFreq.get(guard);
    if (!freqMap) {
      freqMap = new Map();
      guardToFreq.set(guard, freqMap);
    }

    for (const num of guardToMinutes.get(guard) || []) {
      let count = freqMap.get(num);
      if (!count) {
        count = 0;
      }

      freqMap.set(num, count + 1);

      if (count + 1 > maxFreq) {
        maxFreq = count + 1;
        maxMin = num;
        maxGuard = guard;
      }
    }
  }

  if (!maxGuard) {
    throw "Most sleeping guard not found!";
  }

  return +maxGuard.split("#")[1] * maxMin;
};

assert(solve1("./example.txt") === 240);
console.log(solve1("../input/2018/day4.txt"));

assert(solve2("./example.txt") === 4455);
console.log(solve2("../input/2018/day4.txt"));
