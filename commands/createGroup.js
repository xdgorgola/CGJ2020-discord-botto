const Discord = require('discord.js');

module.exports = {
    name: 'crear_grupo',
    description: 'Crea un grupo.',
    /** 
     * @summary Envia un mensaje a todos los admins disponibles
     * @param {Discord.Message} message Mensaje
     * @param {string[]} args Argumentos
     * @param {string[]} blockRoles ID de roles a bloquear del grupo
     */
    async execute(message, args, blockRoles) {
        if (args.length < 2) 
        {
            await message.author.send("Numero incorrecto de argumentos.").catch(err => {});
            return;
        }
        
        const name = args[0];
        /** @type {Discord.User[]} */
        const users = [...message.mentions.members.values()];
        if (users.length <= 0)
        {
            await message.author.send("Debe haber al menos un usuario para hacer el equipo.").catch(err => {});
            return;
        }

        /** @type {Discord.Guild} */
        const guild = message.guild;
        /** @type {Discord.CategoryChannel} */
        const category = await guild.channels.create(name, {type: 'category'});
        /** @type {Discord.TextChannel} */
        const textChannel = await guild.channels.create(name, {type: 'text'});
        /** @type {Discord.VoiceChannel} */
        const voiceChannel = await guild.channels.create(name, {type: 'voice'});

        await textChannel.setParent(category);
        await voiceChannel.setParent(category);

        var permissions = [
            {
            id: guild.roles.everyone.id,
            deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
            }
        ];

        blockRoles.forEach(async roleID => {
            console.log(roleID);
            var denyRole = 
            {
                id: roleID,
                deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
            }
            permissions.push(denyRole);
        });

        users.forEach(async user => {
            var allowUser = 
            {
                id: user.id,
                allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
            };
            permissions.push(allowUser);
        });

        await Promise.all([category.overwritePermissions(permissions),
            textChannel.overwritePermissions(permissions),
            voiceChannel.overwritePermissions(permissions)
        ]).catch(err => {
            message.author.send("No se pudo crear el grupo por excepcion, revisa consola.").catch(err => {});
            console.log("Problema grupo\n" + err);
        });
    }
}