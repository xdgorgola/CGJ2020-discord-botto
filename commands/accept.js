const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "acepto",
  description: "Acepta las reglas del servidor",
  /**
   * @summary Comando para aceptar las reglas y entrar al resto del servidor
   * @param {Discord.Message} message Mensaje comando
   * @param {string} entryChannelId ID canal de reglas
   * @param {string} acceptedRoleId ID rol de entrada
   */
  async execute(message, args, entryChannelId, acceptedRoleId, adminRoleId) {
    // Extrayendo información del mensaje antes de borrarlo
    const author = message.author;
    const content = message.content;
    const guild = message.guild;
    utils.logMessage("accept", `Procesando mensaje ${content}`);

    if (message.channel.id !== entryChannelId) {
      utils.logMessage("accept", `Canal ${message.channel.name} no es el de reglas`);
      return;
    }

    // Borramos el mensaje
    utils.logMessage("accept", `Borrando mensaje ${content}`);
    message.delete().catch((err) => {
      utils.logMessage("accept", `Mensaje de !acepto no borrado :( Error: ${err}`);
    });

    // Caso: el usuario envió !acepto sin la cédula
    if (!args.length) {
      utils.logMessage("accept", `El usuario no envió su cédula`);
      author.send("Por favor escribe !acepto (cedula)").catch((err) => {
        utils.logMessage("accept", `Mensaje no enviado :( Error: ${err}`);
      });
      return;
    }

    const guildUser = guild.members.resolve(author);

    // Si el usuario ya fue aceptado, no hacemos más nada (no es posible en condiciones normales)
    if (guildUser.roles.cache.has(acceptedRoleId)) {
      utils.logMessage("accept", `El usuario ya es un participante`);
      return;
    }

    // Otorgamos el rol de usuario acceptado
    guildUser.roles.add(acceptedRoleId);

    // Enviamos el mensaje a los admins
    const admins = guild.roles.resolve(adminRoleId).members;

    const messageForAdmins = `El usuario **${author}** quiere confirmar. Mensaje:\n${content}`;
    await utils.messageAdmins(admins, messageForAdmins);
    utils.logMessage("accept", `Mensaje ${content} enviado a admins`);
  },
};
