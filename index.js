"use strict";

const userJoinRuleEvent = require("./events/joinUserEvent.js");
const roleReactionEvent = require("./events/roleReactEvent.js");

const conf = require("./resources/config.json");
const utils = require("./utils/utils.js");
const scheduled_messages = require(`./resources/${conf.scheduled_messages_file}`);
const Discord = require("discord.js");
const fs = require("fs");

const prefix = conf.prefix;
const token = conf.token;

// Create a new discord client
const Intents = Discord.Intents;
const client = new Discord.Client({
  partials: ["MESSAGE", "GUILD_MEMBER", "REACTION", "USER"],
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  ws: { intents: Discord.Intents.ALL },
});

/** @type {Discord.Collection} */
client.commands = new Discord.Collection();

// Loading command files
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

const reactRolesData = {
  channelID: conf.roles_msg_channel,
  messageID: conf.roles_msg_id,
  reactionMap: new Map(),
};

// Loading messages files
var welcome_msg = "¡Bienvenido al CGJ 2022!";
var reaction_msg = "React here!";

reaction_msg = fileToText(conf.roles_msg_path, reaction_msg).then((data) => {
  reaction_msg = data;
});

/** @type {Discord.Guild}*/
var guild = undefined;
/** @type {Discord.RoleManager}*/
var guildRoleManager = undefined;
/** @type {Discord.Role} */
var lookingForTeamRole = undefined;
/** @type {Map}*/
var mainRolesMap = new Map();

// once client is ready, log Ready!
client.once("ready", () => {
  console.log("Ready!");
  const tempMainRoles = require("./resources/main_roles.json");
  guild = client.guilds.resolve(conf.guild_id);
  guildRoleManager = guild.roles;
  for (const mainRole of tempMainRoles.data) {
    mainRole.role_data.role = guildRoleManager.resolve(
      mainRole.role_data.role_id
    );
    mainRole.role_data.search_role = guildRoleManager.resolve(
      mainRole.role_data.search_role_id
    );
    mainRolesMap.set(mainRole.name, mainRole);
  }

  lookingForTeamRole = guildRoleManager.resolve("774035277156581406");

  // Set up scheduled messages
  if (!conf.scheduled_messages_channel) return;

  console.log("Scheduling messages:");
  for (const m of scheduled_messages.messages) {
    // milliseconds between scheduled date and now
    const timeToWait = new Date(m.date) - Date.now();

    if (timeToWait < 0)
      // message already send or scheduled to some time in the past
      continue;

    console.log(
      "   * Scheduling message '\u001b[36m" +
        m.title +
        "\u001b[0m' to \u001b[32m" +
        m.date +
        "\u001b[0m"
    );

    // Set timeout to wait for 'timeToWait' milliseconds to send message
    setTimeout(() => {
      const channel = client.channels.cache.get(
        conf.scheduled_messages_channel
      );
      channel.send(m.message + " link: " + m.link);
    }, timeToWait);
  }
  console.log("Messages scheduled!");
});

// logint to discord with your app's token
try {
  client.login(token).then((_) => {
    console.log(`Successfully logged into the server`);
  });
} catch {
  console.log(`Error login into the server`);
}

// Esto es un filtrar usuarios y ya

initializeWelcomeMessageEvent();

roleReactionEvent.roleReactRemoveEvent(client, reactRolesData);
roleReactionEvent.rolerReactAddEvent(client, reactRolesData);

client.on("message", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.channel.id === conf.entry_channel_id) {
    if (message.content.trim() !== "!acepto") message.delete().catch((r) => {});
  }
});

client.on("message", async (message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    !message.guild
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (
    command == "reaction" &&
    utils.hasRole(message.author, message.guild, conf.admin_id)
  ) {
    client.commands
      .get("reaction")
      .execute(
        message,
        args,
        reactRolesData,
        reaction_msg,
        conf.roles_table_path
      );
  } else if (command === "acepto")
    client.commands
      .get("acepto")
      .execute(
        message,
        args,
        conf.entry_channel_id,
        conf.accepted_role_id,
        conf.admin_id
      );
  else if (
    command === "clear" &&
    utils.hasRole(message.author, message.guild, conf.admin_id)
  )
    client.commands.get("clear").execute(message, args, conf.admin_id);
  else if (
    command == "crear_grupo" &&
    utils.hasRole(message.author, message.guild, conf.admin_id)
  )
    client.commands
      .get("crear_grupo")
      .execute(message, args, [conf.accepted_role_id, "784208251168358400"]);
  else if (
    command == `refresh` &&
    utils.hasRole(message.author, message.guild, conf.admin_id)
  )
    client.commands
      .get("refresh")
      .execute(
        message,
        conf.roles_msg_id,
        conf.roles_msg_channel,
        reactRolesData,
        conf.roles_table_path
      );
});

client.on("message", async (message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.guild
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (command == `buscar_rol`)
    client.commands
      .get("buscar_rol")
      .execute(message, args, mainRolesMap, guild, lookingForTeamRole);
  else if (command == "buscar_equipo")
    client.commands
      .get("buscar_equipo")
      .execute(message, args, mainRolesMap, guild);
  else if (command === "admin") {
    if (guild.member(message.author)) {
      client.commands.get("admin").execute(message, args, conf.admin_id, guild);
    }
  }
});

async function fileToText(path, def_mes, fallback = true) {
  var msg = def_mes;
  try {
    var prom = await fs.promises.readFile(path, {
      encoding: "utf8",
      flag: "r",
    });
    msg = prom.toString();
  } catch (error) {
    if (error.code != "ENOENT" || !fallback) throw error;
  }
  return msg;
}

async function initializeWelcomeMessageEvent() {
  await fileToText(conf.welcome_path, welcome_msg)
    .then((data) => {
      welcome_msg = data;
    })
    .catch((r) =>
      console.log(
        "No se pudo inicializar mensaje de bienvenida por: " + "\n" + r
      )
    );

  userJoinRuleEvent.welcomeMessageEvent(client, welcome_msg);
}
