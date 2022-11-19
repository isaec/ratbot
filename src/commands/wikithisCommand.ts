import titleCase from "ap-style-title-case";
import {
  AppInstance,
  commandEvents,
  CommandInterface,
} from "./commandInterface";
import { getDetailsFromUserId } from "@helpers/slack/users";
import {
  createPageFromMessage,
  creationResult,
  getUrlFromTitle,
} from "@helpers/wiki/createPage";
import { url } from "@formatters/dataFormatter";
import { channelMap } from "@src/helpers/slack/channels";
import replaceAsync from "string-replace-async";

const wikithisRegex = /^\.wikithis\s+(.*)$/i;
const containsHowTo = /how to/i;

const getTitleFromMessage = (message: string) => {
  const match = message.match(wikithisRegex);
  if (match === null) return undefined;
  return titleCase(match[1]);
};

const titleMatcher = [
  ["how to", "How To"],
  ["discussion", "Discussion"],
];

const channelCategoryMatcher = [
  [["code", "programming", "software"], "Programming"],
  [["engineer", "mechanical", "prototypes"], "Mechanical"],
  [["cad", "fusion360"], "CAD"],
  [["electrical"], "Electrical"],
  [["machining"], "CAM"],
] as Array<[string[], string]>;

const getCatagories = ({
  title,
  channel,
}: {
  title: string;
  channel: string | undefined;
}) => {
  console.log("getCatagories", { title, channel });

  const catagories: string[] = [];

  for (const [match, category] of titleMatcher) {
    if (title.toLowerCase().includes(match)) {
      catagories.push(category);
    }
  }

  if (channel !== undefined)
    for (const [channels, category] of channelCategoryMatcher) {
      const lowercaseChannel = channel.toLowerCase();

      if (channels.some((c) => lowercaseChannel.includes(c)))
        catagories.push(category);
    }
  return catagories;
};

const pingRegex = /<@([A-Z0-9]+)>/g;
const replacePingWithName = async (app: AppInstance, text: string) =>
  replaceAsync(text, pingRegex, async (match, id) => {
    console.log({ match, id });
    const user = await getDetailsFromUserId(app, id);
    return `'''''@${user.name}'''''` ?? match;
  });

export default {
  name: "wikithis",
  howToUse: `message should be of the form ".wikithis <title>" in a thread`,
  commandRegex: wikithisRegex,
  executer: async function* (app, { message, say }) {
    const title = getTitleFromMessage(message.text);
    if (title === undefined) return yield commandEvents.Help;

    yield commandEvents.Message(
      `Attempting to create page with title "${title}"...`
    );

    const thread = await app.client.conversations.replies({
      token: process.env.SLACK_BOT_TOKEN,
      channel: message.channel,
      ts: message.thread_ts,
    });
    if (thread.ok === false || thread.messages === undefined) {
      console.error("error fetching thread", { thread });
      return yield commandEvents.Error(
        `Error fetching thread. ${thread.error}`
      );
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
        .map(async (m) => replacePingWithName(app, await m))
    );
    console.log("messagesArray", messagesArray);
    const messages = messagesArray
      // show actual newlines for newline messages
      .map((m) => m.replaceAll("\n", "\n\n"))
      .join("\n\n");
    console.log("messages", messages);

    const catagories = getCatagories({
      title,
      channel: channelMap.get(message.channel).name,
    });

    console.log("catagories", catagories);

    const result = await createPageFromMessage(title, messages, catagories);
    // repetitive but it's fine
    switch (result) {
      case creationResult.PageExists: {
        console.error("page already exists", { title });
        return yield commandEvents.Message(
          `Page with title "${title}" already exists ${url(
            "here",
            getUrlFromTitle(title)
          )}. Use a unique title.`
        );
      }
      case creationResult.Error: {
        console.error("error creating page", { title });
        return yield commandEvents.Error(
          `Error creating page with title "${title}". Details have been logged.`
        );
      }
      case creationResult.Success: {
        return yield commandEvents.Message(
          `Page with title ${url(
            title,
            getUrlFromTitle(title)
          )} created successfully.`
        );
      }
    }
  },
} as CommandInterface;
