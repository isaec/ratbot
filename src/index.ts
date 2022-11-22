import { App } from "@slack/bolt";
import * as net from "net";
import * as dotenv from "dotenv";

import { channelIterator, DefinedChannel } from "@helpers/slack/channels";
import injectCommands from "@commands/injectCommands";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// inject all the dot commands
injectCommands(app);

await app.start(process.env.PORT || 3000).then(() => {
  console.log("⚡️ Bolt app is running!");
});

// support fly io health checks
const server = net.createServer((socket) => {
  console.log("health check from fly.io");
  socket.write("health check OK");
  socket.pipe(socket);
});

if (process.env.SUPPORT_HEALTH_CHECK !== "false")
  server.listen(process.env.PORT || 3000);

// join all channels, after setting up health checks
const joinChannel = async (channel: DefinedChannel) => {
  if (channel.is_member || channel.is_archived) return false;
  await app.client.conversations.join({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel.id,
  });
  return true;
};
channelIterator(app, joinChannel);
setInterval(() => {
  console.log("daily channel join");
  channelIterator(app, joinChannel);
}, 1000 * 60 * 60 * 24 /* 1 day */);
