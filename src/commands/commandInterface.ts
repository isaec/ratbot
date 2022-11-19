import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

type AppInstance = App<StringIndexed>;
type Message = Exclude<Parameters<AppInstance["message"]>[0], string | RegExp>;

const enumValue =
  <T>(key: string, _type: T) =>
  (value: T) => ({ [key]: value });

export const commandResults = {
  Success: "Success",
  Error: "Error",
  Message: enumValue("text", ""),
} as const;

// enum
type CommandResults = typeof commandResults[keyof typeof commandResults];

export default interface CommandInterface {
  name: string;
  howToUse: string;
  commandRegex: RegExp;
  listener: (app: AppInstance, message: Message) => Promise<void>;
}
