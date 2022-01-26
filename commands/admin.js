const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "admin",
  description: "Contacta a un admin",
  /**
   * @summary Envia un mensaje a todos los admins disponibles
   * @param {Discord.Message} message Mensaje
   * @param {string[]} args Argumentos
   * @param {string} adminRoleID Role de los admin.
   */
  async execute(message, args, adminRoleID) {
    const author = message.author;

    if (!args.length) {
      await author
        .send("Para llamar a un admin, incluye un mensaje con la razon de su contacto!")
        .catch((err) =>
          utils.logMessage("admin", `No se pudo enviar mensaje a usuario por: ${err}`)
        );
      return;
    }

    await author
      .send(
        `Un admin ya fue notificado y te contactará lo mas pronto posible!` +
          `\nDisculpa los inconvenientes.`
      )
      .catch((err) => utils.logMessage("admin", `No se pudo enviar mensaje a usuario por: ${err}`));

    const admins = message.guild.roles.resolve(adminRoleID).members;
    const reason = args.reduce((a, b) => a + " " + b);
    const messageForAdmins = `El usuario **${author}** solicita un admin por:\n${reason}`;
    await utils.messageAdmins(admins, messageForAdmins);
  },
};
