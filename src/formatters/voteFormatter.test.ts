import { generate, some } from "generate-combinations";
import { describe, expect, test } from "vitest";
import { formatVote, VoteData } from "./voteFormatter";

const voteData = generate<VoteData>({
  for: some(["ian", "andy", "mark", "taylor"]),
  against: some(["jasmine", "isaac", "zach"]),
});

describe("formatVote", () => {
  test.each(voteData)("formatVote(%o)", (voteData) => {
    expect(formatVote(voteData)).toMatchSnapshot();
  });
});
