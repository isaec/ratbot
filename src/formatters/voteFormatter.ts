import { AppInstance } from "@src/commands/commandInterface";
import { divider, md, section, SlackBlock } from "@src/helpers/slack/blocks";
import { getDetailsFromUserId } from "@src/helpers/slack/users";
import { formatList } from "./stringFormatter";

export type UserId = string;
export type VoteData = {
  for: UserId[];
  against: UserId[];
};

export const parseExistingVote = (existingVote: SlackBlock): VoteData => {};

const getNameList = async (
  app: AppInstance,
  userIds: UserId[]
): Promise<string[]> =>
  (
    await Promise.all(
      userIds.map((userId) => getDetailsFromUserId(app, userId))
    )
  ).map((user) => user?.real_name ?? "Unknown");

export const formatVote = async (
  app: AppInstance,
  voteData: VoteData
): Promise<SlackBlock> => {
  const forNames = await getNameList(app, voteData.for);
  const againstNames = await getNameList(app, voteData.against);
  const optionalLabeledList = (label: string, list: string[]) =>
    list.length > 0 ? `${label}: ${formatList(list)}` : "";
  return [
    divider(),
    section(
      md(
        `${optionalLabeledList("For", forNames)}${
          forNames.length > 0 && againstNames.length > 0 ? "\n" : ""
        }${optionalLabeledList("Against", againstNames)}`
      )
    ),
  ];
};
