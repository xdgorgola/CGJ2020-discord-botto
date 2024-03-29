"use strict";

// Dependencies
const Discord = require("discord.js");
const fs = require("fs");

// Project files
const roleReactionEvent = require("./events/roleReactEvent.js");
const conf = require("./resources/config.json");
const scheduled_messages = require(`./resources/scheduledMessages.json`);
const utils = require("./utils/utils.js");

// Create a new discord client
const Intents = Discord.Intents;
const client = new Discord.Client({
  partials: ["MESSAGE", "GUILD_MEMBER", "REACTION", "USER"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  ws: { intents: Discord.Intents.ALL },
});

client.commands = new Discord.Collection();

// Loading commands from files and adding them to
// the client's collection
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Logging into Discord with the config's token
const token = conf.token;
try {
  utils.logMessage("main", "Attempting to log into the server...");

  client.login(token).then(() => {
    utils.logMessage("main", `Successfully logged into the server`);
  });
} catch {
  utils.logMessage("main", `Error login into the server!`);
}

// Once client is ready, we start everything!
client.once("ready", () => {
  utils.logMessage("main", "Client ready!");

  // Set up scheduled messages
  if (!conf.scheduled_messages_channel) return;

  utils.logMessage("main", "Scheduling messages:");
  for (const m of scheduled_messages.messages) {
    // milliseconds between scheduled date and now
    const timeToWait = new Date(m.date) - Date.now();

    if (timeToWait < 0)
      // message already send or scheduled to some time in the past
      continue;

    utils.logMessage(
      "main",
      `  * Scheduling message '\u001b[36m${m.title}\u001b[0m' to \u001b[32m${m.date}\u001b[0m`
    );

    // Set timeout to wait for 'timeToWait' milliseconds to send message
    setTimeout(() => {
      const channel = client.channels.cache.get(conf.scheduled_messages_channel);
      channel.send(m.message + " link: " + m.link);
    }, timeToWait);
  }
  utils.logMessage("main", "Messages scheduled!");
});

const reactRolesData = {
  channelID: conf.roles_msg_channel,
  messageID: conf.roles_msg_id,
  reactionMap: new Map(),
};

// Loading messages files
var welcome_msg = "¡Bienvenido al CGJ 2022!";
utils.initWelcomeMessageEvent(client, welcome_msg);

var reaction_msg = "¡Reacciona para obtener roles aquí!";
reaction_msg = utils.fileToText(conf.roles_msg_path, reaction_msg).then((data) => {
  reaction_msg = data;
});
roleReactionEvent.roleReactRemoveEvent(client, reactRolesData);
roleReactionEvent.roleReactAddEvent(client, reactRolesData);

// Eliminar todos los mensajes en el canal de reglas
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.channel.id === conf.entry_channel_id) {
    // Únicamente eliminamos los mensajes que no empiecen por `!acepto`
    // ya que esos se eliminan en el manejador del comando acepto
    if (!message.content.trim().startsWith("!acepto")) {
      utils.logMessage("main", `Eliminando mensaje del canal de reglas: ${message.conten}`);
      message.delete().catch((err) => {
        utils.logMessage("main", `Error al eliminar mensaje del canal de reglas: ${err}`);
      });
    }
  }
});

// Manejador principal de comandos
const prefix = conf.prefix;
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  const isAdmin = await utils.isAdmin(message.author, message.guild);

  if (command == "reaction" && isAdmin) {
    client.commands
      .get("reaction")
      .execute(message, args, reactRolesData, reaction_msg, conf.roles_table_path);
  } else if (command === "acepto") {
    client.commands
      .get("acepto")
      .execute(message, args, conf.entry_channel_id, conf.accepted_role_id, conf.admin_id);
  } else if (command === "clear" && isAdmin) {
    client.commands.get("clear").execute(message, args);
  } else if (command == "crear_grupo" && isAdmin) {
    client.commands.get("crear_grupo").execute(message, args, conf.accepted_role_id);
  } else if (command == `refresh` && isAdmin) {
    client.commands.get("refresh").execute(message, reactRolesData, conf.roles_table_path);
  } else if (command === "admin") {
    client.commands.get("admin").execute(message, args, conf.admin_id);
  }
});
