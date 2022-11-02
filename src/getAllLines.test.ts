import { assert, expect, test } from "vitest";
import { getAllLines, setToSortedArray } from "./getAllLines";

test.each([
  "Seeking approval for lines 86 and 87 (parts to fix swerve modules)",
  "requesting approval for line 88 for wheels for second intake shooter roller to swap if needed",
  "requesting approval for lines 89-91 for wheels for second intake shooter roller to swap if needed",
  "requesting mentor approval for line 93 (edited)",
  " Seeking approval for line 96 for 1/4-20 drill tap bits",
  "Seeking approval for line 99-bolt extractors for falcon stripped screws",
  " Requesting approval for line 102-104 need belts for 2nd intake and spares.",
  "seeking approval for lines 112-114",
  " Requesting approval for lines 117-118 for prototyping bolts and wing nuts \n Currently the bolts are button head and I'm not too sure if those are better than socket heads and the ones on the sheet are fully threaded",
  "seeking approval line 122 & 124",
  "seeking approval for lines 125-127, bumper fabric for onseason and shoulder bolt for swerve (edited) ",
  " seeking approval for lines 134 and 135. are the 3 1/2 needles the correct types we need?",
  "req approval for lines 129-130 (surgical tubing, diff ID). Same ones ordered as last year",
  "seeking approval for lines 16-18 and 22",
])(`getAllLines(%s)`, (text) => {
  expect(setToSortedArray(getAllLines(text))).toMatchSnapshot();
});
