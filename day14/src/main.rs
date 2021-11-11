fn ends_in(start: usize, r: &Vec<u64>, n: &Vec<u64>) -> i64 {
    if start < n.len() {
        return -1
    }

    let mut equal = true;
    for i in (0..n.len()).rev() {
        equal &= r[start - 1 - (n.len() - i  - 1)] == n[i];
    }

    if equal {
        start as i64 - n.len() as i64
    } else {
        -1
    }
}

fn solve2(num: &str) -> i64 {
    let nums: Vec<u64> = num.split("")
        .filter(|n| n != &"")
        .map(|n| n.parse::<u64>().unwrap())
        .collect();
    let mut recipes: Vec<u64> = vec!();
    recipes.push(3);
    recipes.push(7);

    let mut e1 = 0;
    let mut e2 = 1;
    let mut r = -1;

    while r == -1 {
        let sum = recipes[e1] + recipes[e2];
        let digits = sum.to_string();
        for digit in digits.split("") {
            if digit != "" {
                recipes.push(digit.parse::<u64>().unwrap());
            }
        }

        e1 = (e1 + recipes[e1] as usize + 1) % recipes.len();
        e2 = (e2 + recipes[e2] as usize + 1) % recipes.len();

        r = ends_in(recipes.len(), &recipes, &nums);
        if r == -1 {
            r = ends_in(recipes.len() - 1, &recipes, &nums);
        }
    }

    r
}


fn main() {
    println!("{}", solve2("580741"));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ends_in() {
        assert_eq!(ends_in(3, &vec![1, 2, 3], &vec![4, 5, 6, 7]), -1);
        assert_eq!(ends_in(3, &vec![1, 2, 3], &vec![2, 3]), 1);
        assert_eq!(ends_in(6, &vec![1, 2, 3, 4, 5, 6], &vec![4, 5, 6]), 3);
        assert_eq!(ends_in(6, &vec![1, 2, 3, 4, 5, 6], &vec![4, 5]), -1);
        assert_eq!(ends_in(5, &vec![1, 2, 3, 4, 5, 6], &vec![4, 5]), 3);
    }

    #[test]
    fn test() {
        assert_eq!(solve2("51589"), 9);
        assert_eq!(solve2("01245"), 5);
        assert_eq!(solve2("92510"), 18);
        assert_eq!(solve2("59414"), 2018);
    }
}
