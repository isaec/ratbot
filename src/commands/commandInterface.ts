import { EnumValues, makeEnum, val } from "@enum";
import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

type AppInstance = App<StringIndexed>;
type Message = Exclude<Parameters<AppInstance["message"]>[0], string | RegExp>;

export const commandEvents = makeEnum({
  Success: val("Success"),
  Help: val("Help"),
  Error: val("Error", ""),
  Message: val("Message", ""),
});
export type CommandEvents = EnumValues<typeof commandEvents>;

export default interface CommandInterface {
  name: string;
  howToUse: string;
  commandRegex: RegExp;
  executer: (
    app: AppInstance,
    message: Message
  ) => AsyncIterableIterator<CommandEvents>;
}
