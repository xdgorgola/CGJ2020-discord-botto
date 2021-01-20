const Discord = require('discord.js');

module.exports = {
    /**
     * @param {Discord.Client} client Cliente de Discord del bot
     * @param {object} reactRolesData Data de reacciones
     */
    rolerReactAddEvent(client, reactRolesData)
    {
        client.on('messageReactionAdd', async (re, us) => {
            if (reactRolesData.channelID === undefined || reactRolesData.messageID === undefined ||
                !re.message.guild || us.bot)
                return;

            if (reactRolesData.channelID !== re.message.channel.id ||
                reactRolesData.messageID !== re.message.id)
            {
                console.log("Ignorar reaccion");
                return;
            }

            try
            {
                const validReactions = reactRolesData.reactionMap;
                var roleIDToAdd = null;

                if (re.emoji.id != null)
                    roleIDToAdd = validReactions[re.emoji.id];
                else
                    roleIDToAdd = validReactions[re.emoji.toString()];

                var role = re.message.guild.roles.cache.get(roleIDToAdd);

                //console.log(re.emoji.toString());
                //await re.message.channel.send("Emoji string: " + re.emoji.toString());
                //await re.message.channel.send("Reaction emoji ID: " + re.emoji.id);

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
    },
    /**
     * @param {Discord.Client} client Cliente de Discord del bot
     * @param {object} reactRolesData Data de reacciones
     */
    roleReactRemoveEvent(client, reactRolesData)
    {
        client.on('messageReactionRemove', async (re, us) => {
            if (!reactRolesData.channelID || !reactRolesData.messageID ||
                !re.message.guild || us.bot)
                return;

            if (reactRolesData.channelID !== re.message.channel.id ||
                reactRolesData.messageID !== re.message.id)
            {
                console.log("Ignorar reaccion");
                return;
            }

            const validReactions = reactRolesData.reactionMap;
            var roleToRemove = null;

            if (re.emoji.id != null)
                roleToRemove = validReactions.get(re.emoji.id);
            else
                roleToRemove = validReactions.get(re.emoji.toString());

            console.log(re.emoji.toString());
            //await re.message.channel.send("Emoji string: " + re.emoji.toString());
            //await re.message.channel.send("Reaction emoji ID: " + re.emoji.id);

            await re.message.guild.member(us).roles.remove(roleToRemove);

            console.log(reactRolesData.channelID);
            console.log(reactRolesData.messageID);
        });
    }
}
