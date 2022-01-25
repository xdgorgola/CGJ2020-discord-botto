const Discord = require("discord.js");
const conf = require("./resources/config.json");

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
   * @summary Retorna lista con usuarios que tienen los roles pasados
   * @param {Discord.Guild} guild Guild asociado al rol
   * @param {Discord.Role[]} roles Roles a checkear
   * @param {boolean} without Indica si se deben o no tener los roles
   */
  usersWithRole(guild, roles, without = false) {
    if (!without)
      return guild.members.cache
        .array()
        .filter(
          (gm) =>
            roles.filter((r) => r.members.has(gm.id)).length === roles.length
        );
    else
      return guild.members.cache
        .array()
        .filter(
          (gm) =>
            roles.filter((r) => !r.members.has(gm.id)).length === roles.length
        );
  },

  /**
   * @summary Identifies a custom emoji
   * @param {string} emoji Emoji string data received from a message
   */
  isCustom(emoji) {
    return emoji.startsWith("\\<");
  },

  /**
   * @summary Extracts ID from a custom emoji
   * @param {string} customID Custom Emoji full format  <...>
   */
  extractCustomID(customID) {
    try {
      const cust = customID.split(":")[2];
      return cust.slice(0, cust.length - 1);
    } catch (error) {
      return undefined;
    }
  },
};
