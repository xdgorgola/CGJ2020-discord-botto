"use strict";

const fs = require('fs');
const Discord = require('discord.js');
const conf = require('./config.json');

const prefix = conf.prefix;
const token = conf.token;

// create a new discord client
const client = new Discord.Client({ partials: ['MESSAGE', 'GUILD_MEMBER', 'REACTION', 'USER'] });

client.commands = new Discord.Collection();

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
client.login(token).catch((error) => {
    console.error(`Error login:\n${error}`);
})



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
        client.commands.get('acepto').execute(message, conf.entry_channel_id, conf.entry_role_id, conf.accepted_role_id);
    else if (command === 'admin')
        client.commands.get('admin').execute(message, args, conf.admin_id);
    else if (command === 'clear' && isRole(message.author, message.guild, conf.admin_id))
        client.commands.get('clear').execute(message, args);
    else if (command == `refresh`)
        client.commands.get('refresh').execute(
            message,
            conf.roles_msg_id,
            conf.roles_msg_channel,
            reactRolesData,
            conf.roles_table_path);
});



client.on('messageReactionAdd', async (re, us) => {
    if (reactRolesData.channelID === undefined || reactRolesData.messageID === undefined ||
        !re.message.guild || us.bot)
        return;

    try {
        const validReactions = reactRolesData.reactionMap;
        var roleIDToAdd = null;

        if (re.emoji.id != null)
            roleIDToAdd = validReactions.get(re.emoji.id);
        else
            roleIDToAdd = validReactions.get(re.emoji.toString());

        var role = re.message.guild.roles.cache.get(roleIDToAdd);

        console.log(re.emoji.toString());
        await re.message.channel.send("Emoji string: " + re.emoji.toString());
        await re.message.channel.send("Reaction emoji ID: " + re.emoji.id);

        if (!role) {
            console.log("Wrong emoji!");
            await re.remove()
            return;
        }   

        await re.message.guild.member(us).roles.add(role);

        console.log(reactRolesData.channelID);
        console.log(reactRolesData.messageID);
    }
    catch (error) {
        await re.users.remove(us);
        await us.send(
            "Hola! Mi bot se crasheo :( ...\n" +
            "¿Podrías mandarme un dm para solventarlo?\n" +
            "PD: Soy nuevo haciendo bots.\nAtt~ Gorgola");
    }
});



client.on('messageReactionRemove', async (re, us) => {
    if (!reactRolesData.channelID || !reactRolesData.messageID ||
        !re.message.guild || us.bot)
        return;

    const validReactions = reactRolesData.reactionMap;
    let roleToRemove = null;

    if (re.emoji.id != null)
        roleToRemove = validReactions.get(re.emoji.id);
    else
        roleToRemove = validReactions.get(re.emoji.toString());

    console.log(re.emoji.toString());
    await re.message.channel.send("Emoji string: " + re.emoji.toString());
    await re.message.channel.send("Reaction emoji ID: " + re.emoji.id);

    await re.message.guild.member(us).roles.remove(roleToRemove);

    console.log(reactRolesData.channelID);
    console.log(reactRolesData.messageID);
});



client.on('guildMemberAdd', async (guildUser) => {

    await guildUser.roles.add(conf.entry_role_id).catch(err => {});
    
    var welcome = `Hola ** ${guildUser.user.username} **! Bienvenido al servidor.\n`
    welcome += welcome_msg;
    
    await guildUser.send(welcome).catch(err => {
        console.log("Intentar mandar mensajes a los admins!");
    });
});



function isRole(user, guild, roleID) {
    return (guild.roles.fetch(roleID)).then(r => {
        return r.members.has(user.id);
    })
}



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