import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
import { accumulate, getAllLines } from "./getAllLines";
import { readLine } from "./gsheetReader";

readLine(100);

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.message(/lines?\s*\d+/, async ({ message, say }) => {
  const lines = accumulate(getAllLines(message.text).values());
  if (lines.length === 0) return;

  await say(
    `lol, here are the lines you asked for: ${accumulate(lines.values()).join(
      ", "
    )}`
  );
});

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
