import {
  AppInstance,
  registerCommand,
  CommandInterface,
} from "@commands/commandInterface";
import wikithisCommand from "@commands/wikithisCommand";
import lineCommand from "./lineCommand";
import ratstatusCommand from "./ratstatusCommand";

type CommandDetails = Readonly<{
  errorGetter: ReturnType<typeof registerCommand>;
}>;

export const registeredCommands = new Map<string, CommandDetails>();

const registerCommandWithDetails = (
  app: AppInstance,
  command: CommandInterface
) => {
  const errorGetter = registerCommand(app, command);
  registeredCommands.set(command.name, { errorGetter });
  console.log("inject => registered", command.name);
};

const registerAllCommands = (
  app: AppInstance,
  ...commands: CommandInterface[]
) => {
  commands.forEach((command) => registerCommandWithDetails(app, command));
};

export default (app: AppInstance) => {
  registerAllCommands(app, lineCommand, wikithisCommand, ratstatusCommand);
};
