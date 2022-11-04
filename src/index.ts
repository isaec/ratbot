import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import { formatData, formatDataArray } from "./dataFormatter";
import { accumulate, getAllLines } from "./getAllLines";
import { readSheetLine } from "./gsheetReader";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.message(/lines?\s*\d+/, async ({ message, say }) => {
  const lines = getAllLines(message.text);
  if (lines.size === 0) return;

  // fetch line data from gsheet
  const lineData = await Promise.all(
    accumulate(lines.values()).map(readSheetLine)
  );

  // format the data
  const formattedData = formatDataArray(lineData);

  await say({
    blocks: formattedData,
    thread_ts: message.ts,
  });
});

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
