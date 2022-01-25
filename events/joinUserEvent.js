const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  /**
   * @param {Discord.Client} client Discord bot client
   * @param {string} welcome_msg Mensaje de bienvenida
   */
  welcomeMessageEvent(client, welcome_msg) {
    client.on("guildMemberAdd", async (guildUser) => {
      var welcome = `Bienvenido ** ${guildUser.user} **\n\n`;
      welcome += welcome_msg;

      await guildUser.send(welcome).catch((err) => {
        utils.logMessage(
          "guildMemberAdd",
          "Intentar mandar mensajes a los admins!"
        );
      });
    });
  },
};
