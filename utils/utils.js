const Discord = require("discord.js");

module.exports = {
  /**
   *
   * @param {Discord.User} user User to check role
   * @param {Discord.Guild} guild Guild
   * @param {string} roleID Role to check ID string
   */
  hasRole(user, guild, roleID) {
    return guild.roles.fetch(roleID).then((r) => {
      return r.members.has(user.id);
    });
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
