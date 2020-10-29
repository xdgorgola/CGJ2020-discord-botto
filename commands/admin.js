const Discord = require('discord.js');

module.exports = {
    name: 'admin',
    description: 'Call an admin',
    /** 
     * @summary Envia un mensaje a todos los admins disponibles
     * @param {Discord.Message} message Mensaje
     * @param {string} adminRoleID Role de los admin.
     * @param {string[]} args Argumentos
     */
    async execute(message, args, adminRoleID) {
        if (!args.length) {
            await message.author.send("Para llamar a un admin, incluye un mensaje" + 
            "con la razon de su contacto!").catch(err => {});
            await message.delete({ reason: "Uso incorrecto de !admin" }).catch(err => {});
            return;
        }
        var reason = "";
        const author = message.author;

        await message.delete({ reason: "Esto es secreto!" }).catch(err => console.log("Hubo problemas" +
        " borrando un mensaje de reporte de admin!"));

        reason = args.reduce((a, b) => a + ' ' + b);
        
        await author.send(`Un admin ya fue notificado y te contactara lo mas pronto posible!` + 
        `\nDisculpa las molestias.`).catch(err => {});
        
        
        const admins = message.guild.roles.resolve(adminRoleID).members;
        admins.forEach(async (gm, k, m) => {
            var done = false;
            for (var i = 0; i < 4 && !done; )
            {
                done = true;
                await gm.send(`El usuario` + ` **${author.username}** ` + 
                `solicita un admin por:\n${reason}`).catch(err => done = false);
                
                if (!done)
                    await new Promise(resolve => setTimeout(resolve, 1000));
            }      
            if (!done)
                console.log("No se pudo contactar a NINGUN ADMIN por un reporte hecho.");
        })
    },
}
