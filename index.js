"use strict";

const userJoinRuleEvent = require('./events/joinUserEvent.js');
const roleReactionEvent = require('./events/roleReactEvent.js');

const conf = require('./resources/config.json');
const utils = require('./utils/utils.js');
const Discord = require('discord.js');
const fs = require('fs');

const prefix = conf.prefix;
const token = conf.token;

// Create a new discord client
const client = new Discord.Client({   
    partials: ['MESSAGE', 'GUILD_MEMBER', 'REACTION', 'USER'], 
    ws: { intents: Discord.Intents.ALL } });

client.commands = new Discord.Collection();

// Loading command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

const reactRolesData = {
    channelID: conf.roles_msg_channel,
    messageID: conf.roles_msg_id,
    reactionMap: new Map(),
}

// Loading messages files
var welcome_msg = 'Welcome!';
var reaction_msg = 'React here!';

welcome_msg = fileToText(conf.welcome_path, welcome_msg).then((data) => {
    welcome_msg = data;
});
reaction_msg = fileToText(conf.roles_msg_path, reaction_msg).then((data) => {
    reaction_msg = data;
});


// once client is ready, log Ready!
client.once('ready', () => {
    console.log('Ready!');
});



// logint to discord with your app's token
try
{
    client.login(token);
    console.log(`Successfully logged into the server`);
}
catch
{
    console.log(`Error login into the server`);
}

userJoinRuleEvent.entryRoleEvent(client, conf.entry_role_id);
userJoinRuleEvent.welcomeMessageEvent(client, welcome_msg);

roleReactionEvent.roleReactRemoveEvent(client, reactRolesData);
roleReactionEvent.rolerReactAddEvent(client, reactRolesData);

client.on('message', async message => {

    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild)
        return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command == 'reaction') {
        client.commands.get('reaction').execute(
            message,
            args,
            reactRolesData,
            reaction_msg,
            conf.roles_table_path);
    }
    else if (command === 'acepto')
        client.commands.get('acepto').execute(message, conf.entry_channel_id, conf.entry_role_id);
    else if (command === 'admin')
        client.commands.get('admin').execute(message, args, conf.admin_id);
    else if (command === 'clear' && utils.hasRole(message.author, message.guild, conf.admin_id))
        client.commands.get('clear').execute(message, args);
    else if (command == `refresh`)
        client.commands.get('refresh').execute(
            message,
            conf.roles_msg_id,
            conf.roles_msg_channel,
            reactRolesData,
            conf.roles_table_path);
});

async function fileToText(path, def_mes, fallback = true) {
    var msg = def_mes;
    try {
        var prom = await fs.promises.readFile(path, { encoding: 'utf8', flag: 'r' })
        msg = prom.toString();
    } catch (error) {
        if (error.code != 'ENOENT' || !fallback) throw error;
    }
    return msg;
}