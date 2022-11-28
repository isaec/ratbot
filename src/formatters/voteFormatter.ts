import { SlackBlock } from "@src/helpers/slack/blocks";

export type UserId = string;
export type VoteData = {
  for: UserId[];
  against: UserId[];
};

export const parseExistingVote = (existingVote: SlackBlock): VoteData => {
  return null;
};

export const formatVote = (voteData: VoteData): SlackBlock => {
  return null;
};
