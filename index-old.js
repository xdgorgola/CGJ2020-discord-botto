const fs = require('fs');
// require the discord.js module
const Discord = require('discord.js');
//const config = require('./config.json');
const {prefix, token, bot_username} = require('./config.json');

// create a new discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// once client is ready, log Ready!
client.once('ready', () =>{
    console.log('Ready!');
});

// logint to discord with your app's token
client.login(token);


client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command == 'ping')
        client.commands.get('ping').execute(message, args);
    
    if (command == `puto`)
    {
        if (args.length)
        {
            if (args[0].trim().toLowerCase() == 'fenrir')
            {
                message.channel.send('Ya sabemos que eres puto!');
                return;
            }
        }
        message.channel.send('quisiste decir, fenrir?');
    }
    else if (command == 'kick')
    {
        const taggedUser = message.mentions.users.first();
        if (!message.mentions.users.size)
            return message.reply('You need to tag someone!');

        message.channel.send(`You wanted to kick ${taggedUser.username}`);
    }
    else if (command == 'avatar')
    {
        if (!message.mentions.users.size)
        {
            return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({format: "png", dynamic: true})}`);
        }
        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({format: "png", dynamic: true})}>`;
        })
        message.channel.send(avatarList);
    }
    else if (command == 'clear')
    {
        message.channel.bulkDelete(80);
    }
    else if (command == `user-info`)
    {
        message.channel.send(`Username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
    else if (command == 'args-info')
    {
    if (!args.length)
        return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    else
        message.channel.send(`Command name: ${command}\nArguments: ${args}`);
    }
});
