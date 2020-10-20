const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'reaction',
    description: 'React to assign roles!',
    /**
     * @param {Discord.message} message Command
     * @param {string[]} args Command args
     * @param {Object} message_object Objeto con informacion de emoji/roles
     * @param {string} reaction_message Contenido de mensaje a reaccionar
     * @param {string} path Path output JSON tabla emoji/roles
     */
    async execute(message, args, message_object, reaction_message, path) {
        if (args.length <= 0 || args.length % 2 !== 0) {
            await message.reply("Remember to pass the correct number of parametes!").catch((r) => {
                console.log("There was a problem replying the author of the mesage.")
            });
            return;
        }
        
        
        // Restarting/Initializing Roles <--> Reaction object data
        const reactMessage = await message.channel.send(reaction_message);
        const reactChannel = await message.channel;
        message_object.channelID = reactChannel.id;
        message_object.messageID = reactMessage.id;
        message_object.reactionMap.clear();


        for (var i = 0; i < Math.floor(args.length / 2); ++i) {
            const ie = 2 * i;
            const ir = ie + 1;

            // Extracting emoji from message.
            var emojiID = -1;
            if (this.isCustom(args[ie])) {
                emojiID = this.extractCustomID(args[ie]);
                await message.channel.send("Custom emoji ID: " + emojiID);
                await message.channel.send(args[ie]);
            }
            else {
                emojiID = args[ie];
                console.log(emojiID);
            }


            // Reacting to the message
            await reactMessage.react(emojiID).catch(async (error) => {
                console.log(error);
                await message.channel.send("That's not an emoji!");
                return undefined;
            });


            // Extracting role from message
            var role = null;
            try {
                await message.channel.send("Role ID: " + args[ir]);
                role = await message.guild.roles.fetch(args[ir]);
                await message.channel.send("Role name: " + role.name);
            } catch (error) {
                console.log(error);
                console.log(`${args[ir]} no es un rol valido.`)
                await message.channel.send(`${args[ir]} no es un rol valido.`).catch(err => {});
                return;
            }
            message_object.reactionMap.set(emojiID, role.id);
        }


        // Generating JSON with Roles <--> Reaction data for
        // crash recovering purposes
        var toJsonify = { datas: [] }
        message_object.reactionMap.forEach((role, emoji) => {
            toJsonify.datas.push({ emojiID: emoji, roleID: role });
        });
        fs.writeFile(path, JSON.stringify(toJsonify), (err) => { });
    },


    /**
     * @summary Identifies a custom emoji
     * @param {string} emoji Emoji data received from a message
     */
    isCustom(emoji) {
        return emoji.startsWith("\\<");
    },


    /**
     * @summary Extracts ID from a custom emoji
     * @param {string} customID Emoji full format 
     */
    extractCustomID(customID) {
        try {
            const cust = customID.split(':')[2];
            return cust.slice(0, cust.length - 1);
        } catch (error) {
            return undefined
        }
    },
};