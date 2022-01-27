const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  /**
   * @param {Discord.Client} client Cliente de Discord del bot
   * @param {object} reactRolesData Data de reacciones
   */
  roleReactAddEvent(client, reactRolesData) {
    client.on("messageReactionAdd", async (messageReaction, user) => {
      if (
        reactRolesData.channelID === undefined ||
        reactRolesData.messageID === undefined ||
        !messageReaction.message.guild ||
        user.bot
      )
        return;

      if (
        reactRolesData.channelID !== messageReaction.message.channel.id ||
        reactRolesData.messageID !== messageReaction.message.id
      ) {
        utils.logMessage("roleReactAddEvent", "Ignorando reacción en canal o mensaje incorrecto");
        return;
      }

      try {
        const validReactions = reactRolesData.reactionMap;
        var roleIDToAdd = null;

        if (messageReaction.emoji.id != null)
          roleIDToAdd = validReactions.get(messageReaction.emoji.id);
        else roleIDToAdd = validReactions.get(messageReaction.emoji.toString());

        var role = messageReaction.message.guild.roles.cache.get(roleIDToAdd);

        if (!role) {
          utils.logMessage(
            "roleReactAddEvent",
            `Emoji incorrecto (${messageReaction.emoji.toString()})`
          );
          await messageReaction.remove();
          return;
        }

        await messageReaction.message.guild.members.cache.get(user.id).roles.add(role);

        utils.logMessage("roleReactAddEvent", reactRolesData.channelID);
        utils.logMessage("roleReactAddEvent", reactRolesData.messageID);
      } catch (error) {
        await messageReaction.users.remove(user);
        await user.send(
          "Hola! El bot se crasheó :( ...\n" +
            "¿Podrías mandarnos un dm para solventarlo?\n" +
            "\nAtt~ Organizadores del Caracas Game Jam"
        );
      }
    });
  },

  /**
   * @param {Discord.Client} client Cliente de Discord del bot
   * @param {object} reactRolesData Data de reacciones
   */
  roleReactRemoveEvent(client, reactRolesData) {
    client.on("messageReactionRemove", async (messageReaction, user) => {
      if (
        !reactRolesData.channelID ||
        !reactRolesData.messageID ||
        !messageReaction.message.guild ||
        user.bot
      )
        return;

      if (
        reactRolesData.channelID !== messageReaction.message.channel.id ||
        reactRolesData.messageID !== messageReaction.message.id
      ) {
        utils.logMessage(
          "roleReactRemoveEvent",
          "Ignorando reacción en canal o mensaje incorrecto"
        );
        return;
      }

      const validReactions = reactRolesData.reactionMap;
      var roleToRemove = null;

      if (messageReaction.emoji.id != null)
        roleToRemove = validReactions.get(messageReaction.emoji.id);
      else roleToRemove = validReactions.get(messageReaction.emoji.toString());

      utils.logMessage("roleReactRemoveEvent", messageReaction.emoji.toString());

      await messageReaction.message.guild.members.cache.get(user.id).roles.remove(roleToRemove);
    });
  },
};
