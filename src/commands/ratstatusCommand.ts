import { commandEvents, CommandInterface } from "./commandInterface";

export default {
  name: "ratstatus",
  howToUse: ".ratstatus",
  commandRegex: /^\.ratstatus$/i,
  executer: async function* (app, { message, say }) {
    yield commandEvents.Message("querying ratbot status details...");
  },
} as CommandInterface;
