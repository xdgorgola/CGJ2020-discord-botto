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
      await message
        .reply("Remember to pass the correct number of parametes!")
        .catch((r) => {
          console.log("There was a problem replying the author of the mesage.");
        });
      return;
    }

    var reactMessage;
    // Restarting/Initializing Roles <--> Reaction object data
    try {
      reactMessage = await message.channel.send(reaction_message);
    } catch (err) {
      console.log(`Problem sending reaction message`);
      await message.channel
        .send(`There was a problem setting up` + `the reaction message.`)
        .catch((err) => {});
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
        //await message.channel.send("Custom emoji ID: " + emojiID).catch(err => {});
        //await message.channel.send(args[ie]).catch(err => {});
      } else {
        emojiID = args[ie];
        console.log(emojiID);
      }

      // Reacting to the message
      try {
        await reactMessage.react(emojiID);
      } catch (err) {
        console.log(err);
        console.log(
          `Problem reacting with ${emojiID}.\n` + `Probably non valid emoji`
        );
        //await message.channel.send(`Problem reacting with ${emojiID}.\n` +
        //`Probably non valid emoji`).catch(err => {});
        return;
      }

      // Extracting role from message
      var role = null;
      try {
        //await message.channel.send("Role ID: " + args[ir]).catch(err => {});
        // Previously fetch.
        role = message.guild.roles.resolve(args[ir]);
        //await message.channel.send("Role name: " + role.name).catch(err => {});
      } catch (error) {
        console.log(error);
        console.log(`${args[ir]} no es un rol valido.`);
        //await message.channel.send(`${args[ir]} no es un rol valido.`).catch(err => {});
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
        console.log(`Role file created successfuly`)
      );
    } catch (error) {
      console.warn(
        `Role backup file failed to generate. Try using the command again.` +
          `\nIf not, beware of bot crashes or try creating your own file.`
      );
    }
  },
};
