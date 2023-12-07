#!/usr/bin/env python3

import sys


def get_lines(filename):
    return [l.strip() for l in open(filename, "r")]


def part1(filename):
    lines = get_lines(filename)

    return 0


def part2(filename):
    lines = get_lines(filename)

    return 0


def main():
    assert part1("example.txt") == 0
    print(part1("../input/2018/day1.txt"))

    assert part2("example.txt") == 0
    print(part2("../input/2018/day1.txt"))


if __name__ == "__main__":
    sys.exit(main())
