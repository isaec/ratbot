import { assert, describe, expect, it, test } from "vitest";
import { formatList, formatRange } from "./stringFormatter";

const numbers = (...arr: number[]) => ({ numbers: arr });

describe("formatRange", () => {
  test.each([
    numbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
    numbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
    numbers(1, 3, 4, 5, 6, 7, 8, 9, 10, 11),
    numbers(10, 24, 27, 14, 0, 8, 6, 20, 5, 2, 19, 15, 4, 28, 21, 30),
  ])(`formatRange(%o)`, (obj) => {
    expect(formatRange(obj.numbers)).toMatchSnapshot();
  });
  it.each([
    [numbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10), "1-10"],
    [numbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11), "1-11"],
    [numbers(1, 3, 4, 5, 6, 7, 8, 9, 10, 11), "1, 3-11"],
  ])("formats array of %o to %s", ({ numbers }, expected) => {
    expect(formatRange(numbers)).toBe(expected);
  });
});

describe("formatList", () => {
  it.each([
    [[1, 2, 3], "1, 2 and 3"],
    [[1, 2, 3, 4], "1, 2, 3 and 4"],
    [[1, 2, 3, 4, 5], "1, 2, 3, 4 and 5"],
    [[1, "3"], "1 and 3"],
  ])(`formatList(%o)`, (arr, expected) => {
    expect(formatList(arr)).toBe(expected);
  });
});
