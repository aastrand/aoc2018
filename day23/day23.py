#!/usr/bin/env python3

import re
import sys

from z3 import If, Int, Optimize


def get_lines(filename):
    return [l.strip() for l in open(filename, "r")]


class Bot:
    x = 0
    y = 0
    z = 0
    r = 0

    def __init__(self, x, y, z, r):
        self.x = x
        self.y = y
        self.z = z
        self.r = r

    def __str__(self):
        return "Bot: {x: %s, y: %s, z: %s r: %s}" % (self.x, self.y, self.z, self.r)

    def __repr__(self):
        return self.__str__()


def manhattan(a, b):
    sum = 0

    sum += abs(a.x - b.x)
    sum += abs(a.y - b.y)
    sum += abs(a.z - b.z)

    return sum


BOT_RE = "^pos=<([0-9-]+),([0-9-]+),([0-9-]+)>, r=([0-9]+)$"


def get_bots(lines):
    bots = []
    for line in lines:
        m = re.match(BOT_RE, line).groups()
        bots.append(Bot(int(m[0]), int(m[1]), int(m[2]), int(m[3])))

    return bots


def part1(filename):
    bots = get_bots(get_lines(filename))

    bots.sort(key=lambda x: x.r, reverse=True)
    chosen = bots[0]

    sum = 0
    for bot in bots:
        if manhattan(chosen, bot) <= chosen.r:
            sum += 1

    return sum


def zabs(x):
    return If(x >= 0, x, -x)


# nifty z3 solution from u/mserrano
def part2(filename):
    bots = get_bots(get_lines(filename))

    (x, y, z) = (Int("x"), Int("y"), Int("z"))
    in_ranges = [Int("in_range_" + str(i)) for i in range(len(bots))]
    range_count = Int("sum")

    o = Optimize()

    for i in range(len(bots)):
        o.add(
            in_ranges[i]
            == If(
                zabs(x - bots[i].x) + zabs(y - bots[i].y) + zabs(z - bots[i].z)
                <= bots[i].r,
                1,
                0,
            )
        )
    o.add(range_count == sum(in_ranges))

    dist_from_zero = Int("dist")
    o.add(dist_from_zero == zabs(x) + zabs(y) + zabs(z))

    h1 = o.maximize(range_count)
    h2 = o.minimize(dist_from_zero)

    o.check()

    return o.lower(h2)


def main():
    assert part1("example.txt") == 7
    print(part1("../input/2018/day23.txt"))

    assert part2("example2.txt") == 36
    print(part2("../input/2018/day23.txt"))


if __name__ == "__main__":
    sys.exit(main())
