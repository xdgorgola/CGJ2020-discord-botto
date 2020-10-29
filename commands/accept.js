const Discord = require('discord.js');

module.exports = {
    name: 'acepto',
    description: 'Acepta las reglas del servidor',
    /**
     * @param {Discord.Message} message Mensaje comando
     * @param {string} entry_channel_id ID canal de reglas
     * @param {string} entry_id ID rol de entrada
     */
    async execute(message, entry_channel_id, entry_id) {
        if (message.channel.id !== entry_channel_id)
        {
            console.log(`Canal ${message.channel.name} no es el de reglas`);
            return;
        }
        
        const guildUser = message.guild.members.resolve(message.author);
        
        // No debe ser posible. Fail-Safe just in case
        if (guildUser.roles.cache.has(accepted_id))
            return;
        
        guildUser.roles.remove(entry_id);

        var done = false;
        for (var i = 0; i < 5 && !done; ++i)
        {
            done = true;
            await message.delete({reason: "Acepta reglas servidor"}).catch(err => done = false);
            await new Promise(resolve => setTimeout(resolve, 1000)).catch(err => {});
        }
    },
}
