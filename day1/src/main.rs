use std::{
    collections::HashSet,
    fs::File,
    io::{prelude::*, BufReader},
    path::Path,
};

fn solve1(filename: &str) -> i64 {
    lines_from_file(filename)
        .iter()
        .map(|s| s.parse::<i64>().unwrap())
        .sum()
}

fn solve2(filename: &str) -> i64 {
    let nums: Vec<i64> = lines_from_file(filename)
        .iter()
        .map(|s| s.parse::<i64>().unwrap())
        .collect();

    let mut seen = HashSet::<i64>::new();
    let mut sum: i64 = 0;
    let mut found = false;

    while !found {
        for num in &nums {
            seen.insert(sum);
            sum += num;

            if seen.contains(&sum) {
                found = true;
                break;
            }
        }
    }

    sum
}

fn lines_from_file(filename: impl AsRef<Path>) -> Vec<String> {
    let file = File::open(filename).expect("no such file");
    let buf = BufReader::new(file);
    buf.lines()
        .map(|l| l.expect("Could not parse line"))
        .collect()
}

fn main() {
    println!("{}", solve1("../input/2018/day1.txt"));
    println!("{}", solve2("../input/2018/day1.txt"));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        assert_eq!(solve1("example.txt"), 3);
        assert_eq!(solve2("example2.txt"), 2);
    }
}
