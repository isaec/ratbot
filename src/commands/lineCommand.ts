import { commandEvents, CommandInterface } from "./commandInterface";
import { formatDataArray } from "@formatters/dataFormatter";
import { accumulate, getAllLines } from "@src/getAllLines";
import { readSheetLine } from "@src/gsheetReader";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  name: "line",
  howToUse: "req approval for lines 123-456 and 789",
  commandRegex: /lines?\s*\d+/,
  executer: async function* (app, { message, say }) {
    if (message.channel !== process.env.SLACK_PURCHASE_CHANNEL_ID) return;

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

    yield commandEvents.BlockMessage(formattedData);
  },
} as CommandInterface;
