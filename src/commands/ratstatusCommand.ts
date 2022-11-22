import { md, section, SlackBlock } from "@src/helpers/slack/blocks";
import { commandEvents, CommandInterface } from "./commandInterface";
import { registeredCommands } from "./injectCommands";

export default {
  name: "ratstatus",
  howToUse: ".ratstatus",
  commandRegex: /^\.ratstatus$/i,
  executer: async function* (app, { message, say }) {
    yield commandEvents.Message(
      `querying ratbot status details at *${new Date().toLocaleTimeString()}*`
    );
    for (const [name, { errorGetter }] of registeredCommands) {
      const errorObjects = errorGetter();
      if (errorObjects.length === 0) {
        yield commandEvents.Message(`command *${name}* is loaded and healthy`);
      } else {
        yield commandEvents.BlockMessage([
          section([
            md(`command *${name}* is loaded but has top level errors`),
            md(`*errors:*`),
            ...errorObjects.map((errorObject) =>
              md(
                `*[${errorObject.timestamp.toLocaleTimeString()}]* ${
                  errorObject.error
                }${
                  errorObject.error.stack !== undefined
                    ? `\n\`\`\`${errorObject.error.stack}\`\`\``
                    : ""
                }`
              )
            ),
          ]),
        ]);
      }
    }
  },
} as CommandInterface;
