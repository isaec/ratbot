import { assertExhaustiveSwitch, EnumValues, makeEnum, val } from "@src/enum";
import { App, KnownEventFromType, SayFn } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type AppInstance = App<StringIndexed>;
export type Message = KnownEventFromType<"message">;

export const commandEvents = makeEnum({
  /** Show help message explaining how to use command. Useful for validation failure. */
  Help: val("Help"),
  /** Error that cannot be corrected for, in ratbot code. */
  Error: val<"Error", any>("Error", ""),
  /** A message to send in thread. */
  Message: val("Message", ""),
});
export type CommandEvents = EnumValues<typeof commandEvents>;

export interface CommandInterface {
  name: string;
  howToUse: string;
  commandRegex: RegExp;
  executer: (
    app: AppInstance,
    arg1: { message: Message; say: SayFn }
  ) => AsyncIterableIterator<CommandEvents>;
}

const registerCommand = (app: AppInstance, command: CommandInterface) => {
  app.message(command.commandRegex, async ({ message, say }) => {
    console.log(`${command.name} command detected in ${message.channel}`);

    const sayThread = async (text: string) => {
      await say({
        text,
        thread_ts: message.ts,
      });
    };

    const iterator = command.executer(app, { message, say });
    for await (const event of iterator) {
      switch (event.name) {
        case commandEvents.names.Help:
          await sayThread(command.howToUse);
          break;
        case commandEvents.names.Error:
          await sayThread(
            `This message triggered an error. Details have been logged. message.text is "${message.text}" \n${event.param}`
          );
          console.error(
            `message triggered an error in command ${command.name}`,
            {
              message,
              e: event.param,
            }
          );
          // in the event of an error we should stop execution of the command
          return;
        case commandEvents.names.Message:
          await sayThread(event.param);
          break;
        default:
          assertExhaustiveSwitch(event);
      }
    }
  });
};

export const registerCommands = (
  app: AppInstance,
  ...commands: CommandInterface[]
) => {
  for (const command of commands) {
    registerCommand(app, command);
  }
};
