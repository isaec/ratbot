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

/**
 * wrap the command executer in a try catch so that we can catch unhandled errors and send a message to the user, instead of the command just failing silently
 *
 * @param iterator iterator to wrap
 * @returns yields the same events as the iterator, but if an error is thrown, it will yield a Error event
 */
async function* errorWrapper(iterator: AsyncIterableIterator<CommandEvents>) {
  try {
    yield* iterator;
  } catch (e) {
    yield commandEvents.Error(e);
  }
}

/**
 *
 * @param app the app instance to register the command with
 * @param command the command to register
 * @returns a lambda that returns the last error that was thrown or yielded by the command
 */
export const registerCommand = (
  app: AppInstance,
  command: CommandInterface
) => {
  let errors: ReturnType<typeof commandEvents.Error>[] = [];

  app.message(command.commandRegex, async ({ message, say }) => {
    console.log(`${command.name} command detected in ${message.channel}`);

    const sayThread = async (text: string) => {
      await say({
        text,
        thread_ts: message.ts,
      });
    };

    const iterator = errorWrapper(command.executer(app, { message, say }));
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
          errors.push(event.param);
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

  return () => errors;
};
