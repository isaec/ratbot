import { getDetailsFromUserId } from "@src/helpers/slack/users";
import { generate, some } from "generate-combinations";
import { describe, expect, test, vi } from "vitest";
import { formatVote, VoteData } from "./voteFormatter";

vi.mock("@src/helpers/slack/users");

const voteData = generate<VoteData>({
  for: some(["ian", "andy", "mark", "taylor"]),
  against: some(["jasmine", "isaac", "zach"]),
});

describe("formatVote", () => {
  test.each(voteData)("formatVote(%o)", (voteData) => {
    expect(formatVote(voteData)).toMatchSnapshot();
  });
  test("userMock", async () => {
    expect(await getDetailsFromUserId(null, "U")).toMatchInlineSnapshot(
      `
      {
        "id": "U",
      }
    `
    );
  });
});
