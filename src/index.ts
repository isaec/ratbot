import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import {
  formatData,
  formatDataArray,
  formattedDataArrayToString,
} from "./dataFormatter";
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
  console.log(`message detected in ${message.channel}`);
  if (message.channel !== process.env.SLACK_PURCHASE_CHANNEL_ID) return;

  const lines = getAllLines(message.text);
  if (lines.size === 0) return;

  // fetch line data from gsheet
  const lineData = await Promise.all(
    accumulate(lines.values()).sort().map(readSheetLine)
  );

  // format the data
  const formattedData = formatDataArray(lineData);

  // make string version of data
  const str = formattedDataArrayToString(formattedData);

  await say({
    blocks: formattedData,
    thread_ts: message.ts,
    text: str,
  });
});

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
function formatDataArrayToString(
  formattedData: (
    | {
        type: string;
        text: { type: string; text: string };
        fields: { type: string; text: string }[];
      }
    | { type: string; text: { type: string; text: string }; fields?: undefined }
    | { type: string }
  )[]
) {
  throw new Error("Function not implemented.");
}
