const Discord = require('discord.js');

module.exports = {
    name: 'admin',
    description: 'Call an admin',
    /** 
     * @summary Envia un mensaje a todos los admins disponibles
     * @param {Discord.Message} message Mensaje
     * @param {string[]} args 
     * @param {string} adminRoleID Role de los admin.
     */
    async execute(message, args, adminRoleID) {
        if (!args.length) {
            await message.author.send("Para llamar a un admin, incluye un mensaje con la razon de su contacto!")
            await message.delete({ reason: "Uso incorrecto de !admin" })
            return;
        }
        var reason = "";
        const author = message.author;
        await message.delete({ reason: "Esto es secreto!" }).catch();

        for (const word of args) {
            reason += word + ' ';
        }
        await (await message.guild.roles.fetch(adminRoleID)).members.forEach(async (gm, key, map) => {
            await gm.send(`El usuario` + ` **${author.username}**` + ` solicita un admin por:\n${reason}`);
        });

        var done = false;
        for (var i = 0; i < 4 && !done; )
        {
            done = true;
            await author.send(`Un admin ya fue notificado y te contactara lo mas pronto posible!` + 
            `\nDisculpa las molestias.`).catch(reason => done = false);
            
            if (!done)
                await new Promise(resolve => setTimeout(resolve, 2500));
        }
    }
}
