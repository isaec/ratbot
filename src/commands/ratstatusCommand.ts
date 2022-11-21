import { md, section, SlackBlock } from "@src/helpers/slack/blocks";
import { commandEvents, CommandInterface } from "./commandInterface";
import { registeredCommands } from "./injectCommands";

export default {
  name: "ratstatus",
  howToUse: ".ratstatus",
  commandRegex: /^\.ratstatus$/i,
  executer: async function* (app, { message, say }) {
    yield commandEvents.Message("querying ratbot status details...");
    const details: SlackBlock = [];
    for (const [name, { errorGetter }] of registeredCommands) {
      const errors = errorGetter();
      if (errors.length === 0) {
        details.push(section(md(`command *${name}* is loaded and healthy`)));
      } else {
        details.push(
          section([
            md(`command *${name}* is loaded but has errors`),
            md(`errors:`),
            ...errors.map((e) => md(`${e}`)),
          ])
        );
      }
    }
    yield commandEvents.BlockMessage(details);
  },
} as CommandInterface;
