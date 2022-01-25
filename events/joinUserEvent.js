const Discord = require("discord.js");

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
        console.log("Intentar mandar mensajes a los admins!");
      });
    });
  },
};
