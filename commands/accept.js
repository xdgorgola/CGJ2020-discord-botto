const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "acepto",
  description: "Acepta las reglas del servidor",
  /**
   * @summary Comando para aceptar las reglas y entrar al resto del servidor
   * @param {Discord.Message} message Mensaje comando
   * @param {string} entry_channel_id ID canal de reglas
   * @param {string} accepted_id ID rol de entrada
   */
  async execute(message, args, entry_channel_id, accepted_id, adminRoleID) {
    if (message.channel.id !== entry_channel_id) {
      utils.logMessage(
        `acepto: Canal ${message.channel.name} no es el de reglas`
      );
      return;
    }

    // Caso: el usuario envió !acepto sin la cédula
    if (!args.length) {
      message.author.send("Por favor escribe !acepto (cedula)").catch((err) => {
        utils.logMessage(`acepto: Mensaje no enviado :( Error: ${err}`);
      });
      message.delete().catch((err) => {
        utils.logMessage(
          `acepto: Mensaje de !acepto no borrado :( Error: ${err}`
        );
      });
      return;
    }

    const guild = message.guild;
    const guildUser = message.guild.members.resolve(message.author);

    // No es posible en condiciones normales
    if (guildUser.roles.cache.has(accepted_id)) {
      message.delete().catch((err) => {
        utils.logMessage(
          `acepto: Mensaje de !acepto no borrado :( Error: ${err}`
        );
      });
      return;
    }

    guildUser.roles.add(accepted_id);
    const admins = guild.roles.resolve(adminRoleID).members;
    const author = message.author;

    admins.forEach(async (gm, k, m) => {
      var done = false;
      for (var i = 0; i < 4 && !done; ) {
        done = true;
        await gm
          .send(
            `El usuario` +
              ` **${author}** ` +
              `quiere confirmar. Su mensaje es:\n${message.content}`
          )
          .catch((err) => (done = false));

        if (!done) await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!done)
        utils.logMessage(
          "No se pudo contactar a NINGUN ADMIN por un reporte hecho."
        );
    });

    var done = false;
    for (var i = 0; i < 5 && !done; ++i) {
      done = true;
      await message
        .delete({ reason: "Acepta reglas servidor" })
        .catch((err) => (done = false));
      await new Promise((resolve) => setTimeout(resolve, 1000)).catch(
        (err) => {}
      );
    }
  },
};
