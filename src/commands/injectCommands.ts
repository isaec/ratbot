import {
  AppInstance,
  registerCommand,
  CommandInterface,
} from "@commands/commandInterface";
import wikithisCommand from "@commands/wikithisCommand";

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
};

const registerAllCommands = (
  app: AppInstance,
  ...commands: CommandInterface[]
) => {
  commands.forEach((command) => registerCommandWithDetails(app, command));
};

export default (app: AppInstance) => {
  registerAllCommands(app, wikithisCommand);
};
