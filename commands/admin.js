const Discord = require('discord.js');

module.exports = {
    name: 'admin',
    description: 'Contacta a un admin',
    /** 
     * @summary Envia un mensaje a todos los admins disponibles
     * @param {Discord.Message} message Mensaje
     * @param {string[]} args Argumentos
     * @param {string} adminRoleID Role de los admin.
     * @param {Discord.Guild} guild Guild a buscar admins
     */
    async execute(message, args, adminRoleID, guild) {
        if (!args.length) {
            await message.author.send("Para llamar a un admin, incluye un mensaje" + 
            "con la razon de su contacto!").catch(err => {});
            return;
        }
        var reason = "";
        const author = message.author;

        reason = args.reduce((a, b) => a + ' ' + b);
        
        await author.send(`Un admin ya fue notificado y te contactara lo mas pronto posible!` + 
        `\nDisculpa las molestias.`).catch(err => {});
        
        
        const admins = guild.roles.resolve(adminRoleID).members;
        admins.forEach(async (gm, k, m) => {
            var done = false;
            for (var i = 0; i < 4 && !done; )
            {
                done = true;
                await gm.send(`El usuario` + ` **${author}** ` + 
                `solicita un admin por:\n${reason}`).catch(err => done = false);
                
                if (!done)
                    await new Promise(resolve => setTimeout(resolve, 1000));
            }      
            if (!done)
                console.log("No se pudo contactar a NINGUN ADMIN por un reporte hecho.");
        })
    },
}
