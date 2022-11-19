import { AppInstance, registerCommands } from "@commands/commandInterface";
import wikithisCommand from "@commands/wikithisCommand";

export default (app: AppInstance) => {
  registerCommands(app, wikithisCommand);
};
