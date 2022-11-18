import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import * as dotenv from "dotenv";

type AppInstance = App<StringIndexed>;
type Channel = Required<
  Awaited<ReturnType<AppInstance["client"]["conversations"]["list"]>>
>["channels"][number];

dotenv.config();

const channelMap = new Map<string, Channel>();

channelMap.entries();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const doPaginate = async (
  app: AppInstance,
  cursor: string | undefined,
  whenDone: (channels: IterableIterator<[string, Channel]>) => Promise<void>
) => {
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
  if (result.response_metadata?.next_cursor !== undefined) {
    await sleep(1000);
    await doPaginate(app, result.response_metadata.next_cursor, whenDone);
  } else {
    await whenDone(channelMap.entries());
  }
};
