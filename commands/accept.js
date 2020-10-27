const Discord = require('discord.js');

module.exports = {
    name: 'acepto',
    description: 'Acepta las reglas del servidor',
    /**
     * @param {Discord.message} message Mensaje comando
     * @param {string} entry_channel_id ID canal de reglas
     * @param {*} accepted_id ID rol aceptado reglas
     * @param {*} entry_id ID rol de entrada
     */
    async execute(message, entry_channel_id, entry_id, accepted_id) {
        if (message.channel.id !== entry_channel_id)
            return;
        
        const guildUser = message.guild.members.resolve(message.author);
        
        // No debe ser posible. Fail-Safe just in case
        if (guildUser.roles.cache.has(accepted_id))
            return;
        
        guildUser.roles.remove(entry_id);
        guildUser.roles.add(accepted_id);

        var done = false;
        for (var i = 0; i < 5 && !done; ++i)
        {
            done = true;
            await message.delete({reason: "Acepta reglas servidor"}).catch(err => done = false);
            await new Promise(resolve => setTimeout(resolve, 1000)).catch(err => {});
        }
    },
}
