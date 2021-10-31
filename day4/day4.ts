import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = function (file: string): string[] {
  return readFileSync(file, "utf-8").trim().split("\n");
};

interface LogLine {
  date: Date;
  log: string;
}

const parseLog = function (lines: string[]): Array<LogLine> {
  var logs: Array<LogLine> = [];
  for (let line of lines) {
    const timeRegex = /^\[([0-9-: ]+)\] .*$/gm;
    const match = timeRegex.exec(line);
    if (match !== null) {
      const parts = match[1].split(" ");
      logs.push({
        date: new Date(parts[0] + "T" + parts[1] + ":00"),
        log: line.split("] ")[1],
      });
    } else {
      throw "Illegal log line: " + line;
    }
  }

  logs.sort((a, b) => a.date.getTime() - b.date.getTime());

  return logs;
};

const getGuardToMinutes = function (
  logs: Array<LogLine>
): Map<String, Array<number>> {
  var guardToMinutes: Map<String, Array<number>> = new Map();
  var guard: string | undefined;
  var asleep: Date | undefined;

  for (let i = 0; i < logs.length; i++) {
    if (logs[i].log.includes("Guard")) {
      guard = logs[i].log.split(" begins")[0];
    } else if (logs[i].log.includes("asleep")) {
      asleep = logs[i].date;
    } else if (logs[i].log.includes("wakes")) {
      if (asleep === undefined) {
        throw "wake up before asleep: " + logs[i].date + " " + logs[i].log;
      }

      const minutes =
        logs[i].date.getMinutes() - (asleep ? asleep.getMinutes() : 0);
      for (let dm = 0; dm < minutes; dm++) {
        if (guard === undefined) {
          throw "wake up without guard " + logs[i].log;
        }

        var guardMinutes = guardToMinutes.get(guard);
        if (!guardMinutes) {
          guardMinutes = [];
          guardToMinutes.set(guard, guardMinutes);
        }

        guardMinutes.push(asleep.getMinutes() + dm);
      }

      asleep = undefined;
    } else {
      throw "Illegal log line: " + logs[i].log;
    }
  }

  return guardToMinutes;
};

const solve1 = function (file: string): number {
  var logs: Array<LogLine> = parseLog(parse(file));
  var guardToMinutes: Map<String, Array<number>> = getGuardToMinutes(logs);

  var max = 0;
  var maxGuard: String | undefined;
  for (let g of guardToMinutes.keys()) {
    const minutes = guardToMinutes.get(g);
    if (minutes && minutes.length > max) {
      max = minutes.length;
      maxGuard = g;
    }
  }

  if (!maxGuard) {
    throw "Most sleeping guard not found!";
  }

  var minuteCount: Map<number, number> = new Map();
  const maxGuardMinutes = guardToMinutes.get(maxGuard ? maxGuard : "");
  for (let min of maxGuardMinutes ? maxGuardMinutes : []) {
    var count = minuteCount.get(min);
    if (!count) {
      count = 0;
    }
    minuteCount.set(min, count + 1);
  }

  var maxMin = 0;
  var maxCount = 0;
  for (let min of minuteCount.keys()) {
    const count = minuteCount.get(min) || 0;
    if (count > maxCount) {
      maxCount = count;
      maxMin = min;
    }
  }

  return +maxGuard.split("#")[1] * maxMin;
};

const solve2 = function (file: string): number {
  var logs: Array<LogLine> = parseLog(parse(file));
  var guardToMinutes: Map<String, Array<number>> = getGuardToMinutes(logs);

  var maxFreq = 0;
  var maxMin = 0;
  var maxGuard: String | undefined;
  var guardToFreq: Map<String, Map<number, number>> = new Map();

  for (let guard of guardToMinutes.keys()) {
    var freqMap = guardToFreq.get(guard);
    if (!freqMap) {
      freqMap = new Map();
      guardToFreq.set(guard, freqMap);
    }

    for (let num of guardToMinutes.get(guard) || []) {
      var count = freqMap.get(num);
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
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 4455);
console.log(solve2("./input.txt"));
