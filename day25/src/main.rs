use std::{
    collections::HashSet,
    fs::File,
    io::{prelude::*, BufReader},
    path::Path,
};

fn manhattan(a: &Vec<i64>, b: &Vec<i64>) -> i64 {
    let mut dist = 0;

    for i in 0..4 {
        dist += i64::abs(a[i] - b[i]);
    }

    dist
}

fn solve1(filename: &str) -> i64 {
    let lines = lines_from_file(filename);

    let mut consts: Vec<HashSet<Vec<i64>>> = vec![];
    let mut first = HashSet::new();
    first.insert(
        lines[0]
            .trim()
            .split(",")
            .map(|x| x.parse::<i64>().unwrap())
            .collect(),
    );
    consts.push(first);

    for i in 1..lines.len() {
        let line: Vec<i64> = lines[i]
            .trim()
            .split(",")
            .map(|x| x.parse::<i64>().unwrap())
            .collect();

        let mut found: Vec<usize> = vec![];
        for c in 0..consts.len() {
            for s in &consts[c] {
                if manhattan(&line, &s) <= 3 {
                    if !found.contains(&c) {
                        found.push(c);
                    }
                }
            }
        }

        if found.len() == 0 {
            // new constellation!
            let mut new = HashSet::new();
            new.insert(line);
            consts.push(new);
        } else {
            let mut new = HashSet::new();
            for f in &found {
                for s in &consts[*f] {
                    new.insert(s.clone());
                }
            }

            for i in (0..found.len()).rev() {
                consts.remove(found[i]);
            }

            new.insert(line);
            consts.push(new);
        }
    }

    consts.len() as i64
}

fn lines_from_file(filename: impl AsRef<Path>) -> Vec<String> {
    let file = File::open(filename).expect("no such file");
    let buf = BufReader::new(file);
    buf.lines()
        .map(|l| l.expect("Could not parse line"))
        .collect()
}

fn main() {
    println!("{}", solve1("../input/2018/day25.txt"));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_manhattan() {
        let mut a = vec![0, 3, 0, 3];
        let mut b = vec![3, 0, 3, 0];
        assert_eq!(manhattan(&a, &b), 12);

        a = vec![-1, -2, -3, -4];
        b = vec![-5, -6, -7, -8];
        assert_eq!(manhattan(&a, &b), 16);
    }

    #[test]
    fn test() {
        assert_eq!(solve1("example1.txt"), 2);
        assert_eq!(solve1("example2.txt"), 4);
        assert_eq!(solve1("example3.txt"), 3);
        assert_eq!(solve1("example4.txt"), 8);
    }
}
