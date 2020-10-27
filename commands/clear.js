const Discord = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear messages from a channel',
    /**
     * @summary Elimina del canal donde se envio el mensaje, un numero especifico de mensajes
     * @param {Discord.Message} message Mensaje del comando
     * @param {string[]} args Argumentos
     */
    async execute(message, args) {
        if (!args.length || args.length > 1 || !Number.parseInt(args[0])) {
            await message.author.send("Debes introducir un numero").catch(err => {});
            return;
        }


        // Acounting for the command message!
        const amount = Number.parseInt(args[0]) + 1;
        if (amount <= 1) {
            await message.author.send("Debes introducir un numero valido!").catch(err => {});
            return;
        }


        if (amount >= 200) {
            await message.author.send("Lo siento, no puedes borrar mas de 200 mensajes"
                + " al mismo tiempo para evitar problemas con el servidor.").catch(err => {});
            return;
        }


        // Deletion cycle
        var del = amount;
        for (var r = amount; r > 0; r -= del)
            if (del > 99)
                del = 99;
            else if (del > r)
                del = r;

        await message.channel.bulkDelete(del).catch(async reason => {
            await message.author.send(`No fue posible borrar los mensajes`).catch(reason => {
                r = -999;
                console.log(`Borrado de mensajes en ${message.channel.name} fallido.`);
            });
        });
    }
}