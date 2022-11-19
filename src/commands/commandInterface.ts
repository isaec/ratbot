import { assertExhaustiveSwitch, EnumValues, makeEnum, val } from "@enum";
import { App, KnownEventFromType } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

type AppInstance = App<StringIndexed>;
type Message = KnownEventFromType<"message">;

export const commandEvents = makeEnum({
  Success: val("Success"),
  Help: val("Help"),
  Error: val("Error", ""),
  Message: val("Message", ""),
});
export type CommandEvents = EnumValues<typeof commandEvents>;

export interface CommandInterface {
  name: string;
  howToUse: string;
  commandRegex: RegExp;
  executer: (
    app: AppInstance,
    message: Message
  ) => AsyncIterableIterator<CommandEvents>;
}

export const registerCommand = (
  app: AppInstance,
  command: CommandInterface
) => {
  app.message(command.commandRegex, async ({ message, say }) => {
    console.log(`${command.name} command detected in ${message.channel}`);
    const iterator = command.executer(app, message);
    for await (const event of iterator) {
      switch (event.name) {
        case commandEvents.names.Success:
          await say({
            text: `Success!`,
            thread_ts: message.ts,
          });
          break;
        case commandEvents.names.Help:
          await say({
            text: command.howToUse,
            thread_ts: message.ts,
          });
          break;
        case commandEvents.names.Error:
          await say({
            text: `This message triggered an error. Details have been logged. message.text is "${message.text}" ${event.param}`,
            thread_ts: message.ts,
          });
          break;
        case commandEvents.names.Message:
          await say({
            text: event.param,
            thread_ts: message.ts,
          });
          break;
        default:
          assertExhaustiveSwitch(event);
      }
    }
  });
};
