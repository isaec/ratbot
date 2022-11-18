import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import * as dotenv from "dotenv";

type AppInstance = App<StringIndexed>;
type RequireKey<Object, Key extends keyof Object> = Omit<Object, Key> &
  Record<Key, NonNullable<Object[Key]>>;
type Channel = Required<
  Awaited<ReturnType<AppInstance["client"]["conversations"]["list"]>>
>["channels"][number];
export type DefinedChannel = RequireKey<Channel, "id">;

dotenv.config();

const channelMap = new Map<string, DefinedChannel>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isDefinedChannel = (channel: Channel): channel is DefinedChannel =>
  channel.id !== undefined;

const doPaginate = async (
  app: AppInstance,
  cursor: string | undefined,
  whenDoneIterator: (channel: DefinedChannel) => Promise<void>
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
    if (isDefinedChannel(channel)) {
      channelMap.set(channel.id, channel);
    }
  }

  await sleep(parseInt(process.env.SLACK_CHANNEL_PAGINATE_DELAY ?? "1000"));

  const next_cursor = result.response_metadata?.next_cursor;

  if (next_cursor === undefined || next_cursor === "") {
    for (const channel of channelMap.values()) {
      console.log("iterating channel ", channel.name);
      await whenDoneIterator(channel);
      await sleep(parseInt(process.env.SLACK_CHANNEL_ITERATE_DELAY ?? "500"));
    }
  } else {
    await doPaginate(app, next_cursor, whenDoneIterator);
  }
};

export const channelIterator = async (
  app: AppInstance,
  iterator: (channel: DefinedChannel) => Promise<void>
) => {
  await doPaginate(app, undefined, iterator);
};
