import { AppInstance } from "@src/commands/commandInterface";
import { getDetailsFromUserId } from "@src/helpers/slack/users";
import { fakeUserIdArray } from "@src/helpers/slack/__mocks__/users";
import { generate, some } from "generate-combinations";
import { describe, expect, test, vi } from "vitest";
import { formatVote, VoteData } from "./voteFormatter";

vi.mock("@src/helpers/slack/users");

const fakeApp = null as any as AppInstance;

const voteData = generate<VoteData>({
  for: some(fakeUserIdArray.slice(0, 3)),
  against: some(fakeUserIdArray.slice(3, 6)),
});

describe("formatVote", () => {
  test.each(voteData)("formatVote(%o)", async (voteData) => {
    expect(await formatVote(fakeApp, voteData)).toMatchSnapshot();
  });
});
