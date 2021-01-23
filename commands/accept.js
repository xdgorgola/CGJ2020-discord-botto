const Discord = require('discord.js');

module.exports = {
    name: 'acepto',
    description: 'Acepta las reglas del servidor',
    /**
     * @param {Discord.Message} message Mensaje comando
     * @param {string} entry_channel_id ID canal de reglas
     * @param {string} accepted_id ID rol de entrada
     */
    async execute(message, args, entry_channel_id, accepted_id, adminRoleID) {
        if (message.channel.id !== entry_channel_id)
        {
            console.log(`Canal ${message.channel.name} no es el de reglas`);
            return;
        }
        
        if (!args.length)
        {
            return;
        }

        const guild = message.guild;
        const guildUser = message.guild.members.resolve(message.author);
        
        // No debe ser posible. Fail-Safe just in case
        if (guildUser.roles.cache.has(accepted_id))
        {
            console.log("hahaha salu3");
            return;
        }
        
        guildUser.roles.add(accepted_id);

        console.log("hahaha salu2");
        const admins = guild.roles.resolve(adminRoleID).members;
        const author = message.author;

        admins.forEach(async (gm, k, m) => {
            var done = false;
            for (var i = 0; i < 4 && !done; )
            {
                done = true;
                await gm.send(`El usuario` + ` **${author}** ` + 
                `quiere confirmar. Su mensaje es:\n${message.content}`).catch(err => done = false);
                
                if (!done)
                    await new Promise(resolve => setTimeout(resolve, 1000));
            }      
            if (!done)
                console.log("No se pudo contactar a NINGUN ADMIN por un reporte hecho.");
        })

        var done = false;
        for (var i = 0; i < 5 && !done; ++i)
        {
            done = true;
            await message.delete({reason: "Acepta reglas servidor"}).catch(err => done = false);
            await new Promise(resolve => setTimeout(resolve, 1000)).catch(err => {});
        }
    },
}
