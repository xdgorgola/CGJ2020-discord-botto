const Discord = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear messages from a channel',
    /**
     * @summary Elimina del canal donde se envio el mensaje, un numero especifico de mensajes
     * @param {Discord.Message} message Mensaje del comando
     * @param {string[]} args 
     */
    async execute(message, args) {
        if (!args.length || args.length > 1 || !Number.parseInt(args[0])) {
            await message.author.send("Debes introducir un numero valido de mensajes a borrar!")
            return;
        }


        // Acounting for the command message!
        const amount = Number.parseInt(args[0]) + 1;
        if (amount <= 1) {
            await message.author.send("Debes introducir un numero valido de mensajes a borrar!")
            return;
        }


        if (amount >= 200) {
            await message.author.send("Lo siento, no puedes borrar mas de 200 mensajes"
                + " al mismo tiempo para evitar problemas con el servidor.")
            return;
        }


        // Deletion cycle
        var del = amount;
        for (var r = amount; r > 0; r -= del)
            if (del > 99)
                del = 99;
            else if (del > r)
                del = r;

        await message.channel.bulkDelete(del).catch(reason => {
            await message.author.send(`No fue posible borrar los mensajes`).catch(reason => r = -999);
        });
    }
}