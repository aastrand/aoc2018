#!/usr/bin/env python3

import re
import sys
from copy import deepcopy
from enum import Enum
from functools import cmp_to_key


class Type(Enum):
    Infection = 1
    Immune = 2


class Group:
    def __init__(
        self, army, id, units, hp, weaknesses, immunities, ap, attack_type, initiative
    ):
        self.army = army
        self.id = id
        self.units = units
        self.hp = hp
        self.weaknesses = weaknesses
        self.immunities = immunities
        self.ap = ap
        self.attack_type = attack_type
        self.initiative = initiative

    def power(self):
        return self.units * self.ap

    def take_damage(self, damage):
        units_at_start = self.units

        killed = damage // self.hp
        self.units = max(0, self.units - killed)

        return units_at_start - self.units

    def damage_done(self, target):
        dmg = self.power()
        if self.attack_type in target.weaknesses:
            dmg *= 2

        return dmg

    def __str__(self):
        return "%s %s: units: %s, hp: %s, weaknesses: %s, immunities: %s, ap: %s, attack_type: %s, initiative: %s" % (
            self.army,
            self.id,
            self.units,
            self.hp,
            self.weaknesses,
            self.immunities,
            self.ap,
            self.attack_type,
            self.initiative,
        )

    def __repr__(self):
        return self.__str__()


BASE_RE = r"^(\d+) units each with (\d+) hit points (.*)with an attack that does (\d+) ([a-z]+) damage at initiative (\d+)$"
WEAK_RE = r".*weak to ([a-z]+),?(\s*[a-z]+)*.*"
IMMUNE_RE = r".*immune to ([a-z]+),?(\s*[a-z]+)*.*"


def get_groups(lines):
    groups = []

    army = Type.Immune if "Immune" in lines[0] else Type.Infection

    for i in range(1, len(lines)):
        m = re.match(BASE_RE, lines[i]).groups()
        wc = re.match(WEAK_RE, m[2])
        ic = re.match(IMMUNE_RE, m[2])

        weaknesses = []
        if wc is not None:
            for g in wc.groups():
                if g:
                    weaknesses.append(g.strip())

        immunities = []
        if ic is not None:
            for g in ic.groups():
                if g:
                    immunities.append(g.strip())

        groups.append(
            Group(
                army,
                i,
                int(m[0]),
                int(m[1]),
                weaknesses,
                immunities,
                int(m[3]),
                m[4],
                int(m[5]),
            )
        )

    return groups


def target_order(a, b):
    if a.power() > b.power():
        return -1
    elif a.power() < b.power():
        return 1
    else:
        if a.initiative > b.initiative:
            return -1
        elif a.initiative < b.initiative:
            return 1
        else:
            return 0


def fight(groups):
    while True:
        groups.sort(key=cmp_to_key(target_order))

        attacks = {}
        for group in groups:
            max = 0
            target = None

            if group.units == 0:
                continue

            for defender in groups:
                if (
                    defender.units == 0
                    or defender.army == group.army
                    or group.attack_type in defender.immunities
                    or defender in attacks.values()
                ):
                    continue

                dmg = group.damage_done(defender)
                if max < dmg:
                    max = dmg
                    target = defender
            if target:
                attacks[group] = target

        if len(attacks) == 0:
            break

        groups.sort(key=lambda g: g.initiative, reverse=True)

        total = 0
        for group in groups:
            target = attacks.get(group)
            if target and group.units > 0 and target.units > 0:
                dmg = group.damage_done(target)
                killed = target.take_damage(dmg)
                total += killed
        #                print(
        #                    "%s group %s attacks defending group %s, killing %s units"
        #                    % (group.army, group.id, target.id, killed)
        #                )

        if total == 0:
            break

    units = {Type.Immune: 0, Type.Infection: 0}
    for group in groups:
        units[group.army] += group.units

    if units[Type.Infection] == 0:
        winner = Type.Immune
    elif units[Type.Immune] == 0:
        winner = Type.Infection
    else:
        winner = None

    return units.get(winner), winner


def part1(filename):
    with open(filename, "r") as file:
        input = file.read().strip()
    groups = get_groups(input.split("\n\n")[0].split("\n"))
    groups.extend(get_groups(input.split("\n\n")[1].split("\n")))

    return fight(groups)[0]


def part2(filename, start):
    with open(filename, "r") as file:
        input = file.read().strip()

    original = get_groups(input.split("\n\n")[0].split("\n"))
    original.extend(get_groups(input.split("\n\n")[1].split("\n")))

    boost = start

    while True:
        groups = deepcopy(original)

        for group in groups:
            if group.army == Type.Immune:
                group.ap += boost

        sum, winner = fight(groups)
        if winner == Type.Immune:
            break

        boost += 1

    return sum


def main():
    assert part1("example.txt") == 5216
    print(part1("input.txt"))

    assert part2("example.txt", 1570) == 51
    print(part2("input.txt", 1))


if __name__ == "__main__":
    sys.exit(main())
