import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import * as dotenv from "dotenv";

type AppInstance = App<StringIndexed>;
type Channel = Required<
  Awaited<ReturnType<AppInstance["client"]["conversations"]["list"]>>
>["channels"][number];

dotenv.config();

const channelMap = new Map<string, Channel>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const doPaginate = async (
  app: AppInstance,
  cursor: string | undefined,
  whenDoneIterator: (channel: Channel) => Promise<void>
) => {
  console.log("doPaginate ", { cursor });
  const result = await app.client.conversations.list({
    token: process.env.SLACK_BOT_TOKEN,
    cursor,
    types: "public_channel",
  });
  if (result.ok === false) {
    console.error("error fetching channels", { result });
    return;
  }
  for (const channel of result.channels ?? []) {
    if (channel.id === undefined) continue;
    channelMap.set(channel.id, channel);
  }

  await sleep(parseInt(process.env.SLACK_CHANNEL_PAGINATE_DELAY ?? "1000"));

  if (result.response_metadata?.next_cursor !== undefined) {
    await doPaginate(
      app,
      result.response_metadata.next_cursor,
      whenDoneIterator
    );
  } else {
    for (const channel of channelMap.values()) {
      console.log("iterating channel ", channel.name);
      await whenDoneIterator(channel);
      await sleep(parseInt(process.env.SLACK_CHANNEL_ITERATE_DELAY ?? "500"));
    }
  }
};

export const channelIterator = async (
  app: AppInstance,
  iterator: (channel: Channel) => Promise<void>
) => {
  await doPaginate(app, undefined, iterator);
};
