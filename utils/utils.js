const Discord = require("discord.js");
const conf = require("../resources/config.json");

module.exports = {
  /**
   * Determina si un usuario pertenece a los administradores
   * @param {Discord.User} user Usuario a revisar
   * @param {Discord.Guild} guild Instancia del guild (servidor)
   * @returns true o false dependiendo de si el usuario es admin
   */
  async isAdmin(user, guild) {
    return await this.hasRole(user, guild, conf.admin_id);
  },

  /**
   * @summary Determina si un usuario tiene un rol asignado
   * @param {Discord.User} user Usuario a revisar
   * @param {Discord.Guild} guild Instancia del guild (servidor)
   * @returns true o false dependiendo de si el usuario tiene el rol asignado
   */
  async hasRole(user, guild, roleID) {
    const role = await guild.roles.fetch(roleID);
    return role.members.has(user.id);
  },

  /**
   * @summary Identifies a custom emoji
   * @param {string} emoji Emoji string data received from a message
   */
  isCustomEmoji(emoji) {
    return emoji.startsWith("\\<");
  },

  /**
   * @summary Extracts ID from a custom emoji
   * @param {string} customID Custom Emoji full format  <...>
   */
  extractIDFromCustomEmoji(customID) {
    try {
      const cust = customID.split(":")[2];
      return cust.slice(0, cust.length - 1);
    } catch (error) {
      return undefined;
    }
  },

  /**
   * Imprime en la salida estandar un mensaje con el timestamp en que se emitió
   * @param {string} category Tipo u origen del mensaje a registrar
   * @param {string} message Mensaje a registrar en los logs
   */
  logMessage(category, message) {
    const timestamp = new Date().toUTCString();
    console.log(`[${timestamp}] [${category}] ${message}`);
  },
};
