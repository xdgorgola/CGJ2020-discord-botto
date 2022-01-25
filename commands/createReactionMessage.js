const utils = require("../utils/utils.js");
const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "reaction",
  description: "React to assign roles!",
  /**
   * @param {Discord.Message} message Command
   * @param {string[]} args Command args
   * @param {Object} message_object Objeto con informacion de emoji/roles
   * @param {string} reaction_message Contenido de mensaje a reaccionar
   * @param {string} path Path output JSON tabla emoji/roles
   */
  async execute(message, args, message_object, reaction_message, path) {
    if (args.length <= 0 || args.length % 2 !== 0) {
      await message.reply("Remember to pass the correct number of parametes!").catch((err) => {
        utils.logMessage(
          "reaction",
          `There was a problem replying the author of the mesage. Problem: ${err}`
        );
      });
      return;
    }

    var reactMessage;
    // Restarting/Initializing Roles <--> Reaction object data
    try {
      reactMessage = await message.channel.send(reaction_message);
    } catch (err) {
      utils.logMessage("reaction", `Problem sending reaction message`);
      await message.channel
        .send(`There was a problem setting up` + `the reaction message.`)
        .catch(() => {});
      return;
    }

    const reactChannel = message.channel;
    message_object.channelID = reactChannel.id;
    message_object.messageID = reactMessage.id;
    message_object.reactionMap.clear();

    for (var i = 0; i < Math.floor(args.length / 2); ++i) {
      const ie = 2 * i;
      const ir = ie + 1;

      // Extracting emoji from message.
      var emojiID = -1;
      if (utils.isCustomEmoji(args[ie])) {
        emojiID = utils.extractIDFromCustomEmoji(args[ie]);
      } else {
        emojiID = args[ie];
        utils.logMessage("reaction", emojiID);
      }

      // Reacting to the message
      try {
        await reactMessage.react(emojiID);
      } catch (err) {
        utils.logMessage("reaction", err);
        utils.logMessage(
          "reaction",
          `Problem reacting with ${emojiID}.\n` + `Probably non valid emoji`
        );
        return;
      }

      // Extracting role from message
      var role = null;
      try {
        // Previously fetch.
        role = message.guild.roles.resolve(args[ir]);
      } catch (error) {
        utils.logMessage("reaction", error);
        utils.logMessage("reaction", `${args[ir]} no es un rol valido.`);
        return;
      }
      message_object.reactionMap.set(emojiID, role.id);
    }

    // Generating JSON with Roles <--> Reaction data for
    // crash recovering purposes
    var toJsonify = {
      datas: [],
      message_id: reactMessage.id,
      channel_id: reactChannel.id,
    };
    try {
      message_object.reactionMap.forEach((role, emoji) => {
        toJsonify.datas.push({ emojiID: emoji, roleID: role });
      });
      fs.writeFile(path, JSON.stringify(toJsonify), () =>
        utils.logMessage("reaction", `Role file created successfuly`)
      );
    } catch (error) {
      console.warn(
        `Role backup file failed to generate. Try using the command again.` +
          `\nIf not, beware of bot crashes or try creating your own file.`
      );
    }
  },
};
