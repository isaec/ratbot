import { SlackBlock } from "@src/helpers/slack/blocks";

type UserId = string;
type VoteData = {
  for: UserId[];
  against: UserId[];
};

const parseExistingVote = (existingVote: SlackBlock): VoteData => {
  return null;
};

const formatVote = (voteData: VoteData): SlackBlock => {
  return null;
};
