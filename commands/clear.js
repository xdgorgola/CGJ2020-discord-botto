const Discord = require("discord.js");
const utils = require("../utils/utils.js");

module.exports = {
  name: "clear",
  description: "Clear messages from a channel",
  /**
   * @summary Elimina del canal donde se envio el mensaje, un numero especifico de mensajes
   * @param {Discord.Message} message Mensaje del comando
   * @param {string} admin_role Role de admin
   * @param {string[]} args Argumentos
   */
  async execute(message, args, admin_role) {
    if (!args.length || args.length > 1 || !Number.parseInt(args[0])) {
      await message.author
        .send("Debes introducir un numero")
        .catch((err) => {});
      return;
    }

    var isAdmin = await utils.hasRole(
      message.author,
      message.guild,
      admin_role
    );

    if (!isAdmin) return;

    // Acounting for the command message!
    const amount = Number.parseInt(args[0]) + 1;
    if (amount <= 1) {
      await message.author
        .send("Debes introducir un numero valido!")
        .catch((err) => {});
      return;
    }

    console.log(
      `Intentando borrar ${amount - 1} mensajes de ${message.channel.name}`
    );

    if (amount - 1 >= 100) {
      await message.author
        .send(
          "Lo siento, no puedes borrar mas de 99 mensajes" +
            " al mismo tiempo para evitar problemas con el servidor."
        )
        .catch((err) => {});
      return;
    }

    await message.channel.bulkDelete(amount).catch(async (reason) => {
      await message.author
        .send(`No fue posible borrar los mensajes`)
        .catch((reason) => {});
    });
  },
};
