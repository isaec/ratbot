import { CommandInterface } from "./commandInterface";
import { formatDataArray } from "@formatters/dataFormatter";
import { accumulate, getAllLines } from "@src/getAllLines";
import { readSheetLine } from "@src/gsheetReader";
import { slackBlockToString } from "@src/helpers/slack/blocks";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  name: "line",
  howToUse: "req approval for lines 123-456 and 789",
  commandRegex: /lines?\s*\d+/,
  executer: async function* (app, { message, say }) {
    console.log(`message detected in ${message.channel}`);
    if (message.channel !== process.env.SLACK_PURCHASE_CHANNEL_ID) return;

    try {
      const lines = getAllLines(message.text);
      if (lines.size === 0) return;

      // fetch line data from gsheet
      const lineData = await Promise.all(
        accumulate(lines.values())
          .sort((a, b) => a - b)
          .map(readSheetLine)
      );

      // format the data
      const formattedData = formatDataArray(lineData);

      // make string version of data
      const str = slackBlockToString(formattedData);

      await say({
        blocks: formattedData,
        thread_ts: message.ts,
        text: str,
      });
    } catch (e) {
      console.error("message triggered an error", { message, e });
      await say({
        text: `This message triggered an error. Details have been logged. message.text is "${message.text}" ${e}`,
        thread_ts: message.ts,
      });
    }
  },
} as CommandInterface;
