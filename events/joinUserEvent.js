const Discord = require('discord.js');

module.exports = {
    /**
     * @param {Discord.Client} client Discord bot client
     * @param {string} entry_role_id ID de rol de entrada
     */
    entryRoleEvent(client, entry_role_id) {
        client.on('guildMemberAdd', async (guildUser) => {
    
            console.log(`User ${guildUser.user.username} entro al servidor`);
            await guildUser.roles.add(entry_role_id).catch(err => console.log(err));
        });
    },
    /**
     * @param {Discord.Client} client Discord bot client
     * @param {string} welcome_msg Mensaje de bienvenida
     */
    welcomeMessageEvent(client, welcome_msg) {
        client.on('guildMemberAdd', async (guildUser) => {

            var welcome = `Hola ** ${guildUser.user.username} **! Bienvenido al servidor.\n`
            welcome += welcome_msg;
            
            await guildUser.send(welcome).catch(err => {
                console.log("Intentar mandar mensajes a los admins!");
            });
        });
    },
}
