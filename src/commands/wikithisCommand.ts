import titleCase from "ap-style-title-case";
import { commandEvents, CommandInterface } from "./commandInterface";
import * as wikithis from "@commands/wikithisCommand";
import { getDetailsFromUserId } from "@helpers/slack/users";
import {
  createPageFromMessage,
  creationResult,
  getUrlFromTitle,
} from "@helpers/wiki/createPage";
import { url } from "@formatters/dataFormatter";

export const wikithisRegex = /^\.wikithis\s+(.*)$/i;
const containsHowTo = /how to/i;

export const getTitleFromMessage = (message: string) => {
  const match = message.match(wikithisRegex);
  if (match === null) return undefined;
  return titleCase(match[1]);
};

export const getCatagories = ({ title }) => {
  const catagories: string[] = [];
  if (containsHowTo.test(title)) catagories.push("How To");
  return catagories;
};

export default {
  name: "wikithis",
  howToUse: `message should be of the form ".wikithis <title>" in a thread`,
  commandRegex: wikithisRegex,
  executer: async function* (app, { message, say }) {
    console.log("msg", message);

    console.log(`wikithis command detected in ${message.channel}`);
    const title = wikithis.getTitleFromMessage(message.text);
    if (title === undefined) return yield commandEvents.Help;

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
  },
} as CommandInterface;
