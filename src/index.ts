import { App } from "@slack/bolt";
import net from "net";
import * as dotenv from "dotenv";
import {
  formatData,
  formatDataArray,
  formattedDataArrayToString,
  url,
} from "./dataFormatter";
import { accumulate, getAllLines } from "./getAllLines";
import { readSheetLine } from "./gsheetReader";
import { createPageFromMessage, creationResult, getUrlFromTitle } from "./wiki";
import * as wikithis from "./wikithisCommand";
import { getDetailsFromUserId } from "./slackHelpers";

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
    const str = formattedDataArrayToString(formattedData);

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
});

app.message(wikithis.wikithisRegex, async ({ message, say }) => {
  console.log("msg", message);
  console.log(`wikithis command detected in ${message.channel}`);
  const title = wikithis.getTitleFromMessage(message.text);
  if (title === undefined) {
    await say({
      text: wikithis.howToUse,
      thread_ts: message.ts,
    });
    return;
  }
  await say({
    text: `Attempting to create page with title "${title}"...`,
    thread_ts: message.ts,
  });
  const thread = await app.client.conversations.replies({
    token: process.env.SLACK_BOT_TOKEN,
    channel: message.channel,
    ts: message.thread_ts,
  });
  if (thread.ok === false || thread.messages === undefined) {
    await say({
      text: `Error fetching thread. Details have been logged.`,
      thread_ts: message.ts,
    });
    console.error("error fetching thread", { thread });
    return;
  }

  // filter and combine messages
  const messagesArray = await Promise.all(
    thread.messages
      .filter(
        (m) =>
          m.text?.startsWith(".wikithis") === false && m.bot_id === undefined
      )
      .map(async (m) =>
        m.user === undefined
          ? `'''unknown user:''' ${m.text}`
          : `'''${(await getDetailsFromUserId(app, m.user))?.real_name}:''' ${
              m.text
            }`
      )
  );
  console.log("messagesArray", messagesArray);
  const messages = messagesArray
    // show actual newlines for newline messages
    .map((m) => m.replaceAll("\n", "\n\n"))
    .join("\n\n");
  console.log("messages", messages);

  const catagories = wikithis.getCatagories({
    title,
  });

  console.log("catagories", catagories);

  const result = await createPageFromMessage(title, messages, catagories);
  // repetitive but it's fine
  switch (result) {
    case creationResult.PageExists: {
      await say({
        text: `Page with title "${title}" already exists ${url(
          "here",
          getUrlFromTitle(title)
        )}. Details have been logged.`,
        thread_ts: message.ts,
      });
      console.error("page already exists", { title });
      return;
    }
    case creationResult.Error: {
      await say({
        text: `Error creating page with title "${title}". Details have been logged.`,
        thread_ts: message.ts,
      });
      console.error("error creating page", { title });
      return;
    }
    case creationResult.Success: {
      await say({
        text: `Page with title ${url(
          title,
          getUrlFromTitle(title)
        )} created successfully.`,
        thread_ts: message.ts,
      });
      return;
    }
  }
});

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});

// support fly io health checks
const server = net.createServer((socket) => {
  console.log("health check from fly.io");
  socket.write("health check OK");
  socket.pipe(socket);
});

server.listen(process.env.PORT || 3000);
