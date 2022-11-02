import { App } from "@slack/bolt";
import * as dotenv from "dotenv";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

/**
 * matches "line 1234" but not "line 1234 and"
 */
const singleLine = /lines?\s(\d+)(?:\s(?!-|\d|and|&)|$)/g;

const lineRange = /lines?\s(\d+)-(\d+)/g;

const getAllLines = (text: string) => {
  const lines: number[] = [];
  for (const match of text.matchAll(singleLine)) {
    console.log(match);
    if (typeof match[1] === "string") {
      lines.push(parseInt(match[1]));
    }
  }
  for (const match of text.matchAll(lineRange)) {
    console.log(match);
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      for (let i = start; i <= end; i++) {
        lines.push(i);
      }
    }
  }

  return lines;
};

app.message(/lines?\s*\d+/, async ({ message, say }) => {
  const lines = getAllLines(message.text);
  if (lines.length === 0) return;

  await say(`lol, here are the lines you asked for: ${lines.join(", ")}`);
});

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});
