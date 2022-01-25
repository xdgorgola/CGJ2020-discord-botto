const { default: Collection } = require("@discordjs/collection");
const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "refresh",
  description: "Refresh roles message",
  /**
   * @param {object} reactionMessageObject
   * @param {Discord.Message} message
   * @param {string} reactionMapPath
   * @param {string} messageID
   * @param {string} channelID
   */
  async execute(
    message,
    messageID,
    channelID,
    reactionMessageObject,
    reactionMapPath
  ) {
    const guild = message.guild;
    const guildRoles = guild.roles.cache;
    const dataFile = require("../" + reactionMapPath);
    /** @type {Discord.TextChannel} */
    const channel = guild.channels.resolve(dataFile.channel_id);
    const msgManager = channel.messages;
    // Fetching because this cmd is used in case the bot crashes and
    // its probably going to be an uncached msg
    const old_msg = await msgManager.fetch(dataFile.message_id);

    console.log(`Old message content:\n\"${old_msg.content}\"`);

    // We set up the Roles <--> Reaction object
    reactionMessageObject.channelID = dataFile.channel_id;
    reactionMessageObject.messageID = dataFile.message_id;
    reactionMessageObject.reactionMap = new Map();

    // We load Roles <--> Reaction from .JSON on reaction_map_path
    // and generates the resulting reaction map.
    const storageObject = JSON.parse(
      fs.readFileSync(reactionMapPath).toString()
    );
    storageObject.datas.forEach((obj) => {
      reactionMessageObject.reactionMap.set(obj.emojiID, obj.roleID);
    });

    const reactions_mnger = old_msg.reactions;
    /** @type {Discord.MessageReaction[]} */
    var validReactions = [];

    // We check which reactions in the designated reaction message are
    // valid and match the Roles <--> Reaction data loaded.
    console.log(`Reactions found in old msg: ${reactions_mnger.cache.size}`);
    reactions_mnger.cache.forEach((msgReact, reactID) => {
      console.log(`Reaction emoji name: ${msgReact.emoji.name}`);
      console.log(`Reaction custom-id: ${msgReact.emoji.id}`);

      var idToUse =
        msgReact.emoji.id != null ? msgReact.emoji.id : msgReact.emoji.name;

      if (reactionMessageObject.reactionMap.has(idToUse)) {
        console.log(
          `Role associated: ${
            guildRoles.get(reactionMessageObject.reactionMap.get(idToUse)).name
          }`
        );
        validReactions.push(msgReact);
      } else {
        console.log(`Non valid reaction!... Removing`);
        msgReact.remove();
      }
    });

    //const reactPromArray = validReactions.map(r => {
    //    return new Promise(resolve => resolve(userFromReact(r)));
    //});
    //await Promise.all(reactPromArray);

    /**
     * @summary Adds/removes a role associated to a reaction from an user if it is needed
     * @param {Discord.GuildMember} user User to process
     * @param {Discord.MessageReaction} react Reaction to check
     * @param {Discord.Role} role Role associated to the reaction
     */
    const processUser = async (user, role, reactUsers) => {
      if (!reactUsers.has(user.id) && user.roles.cache.has(role.id))
        user.roles.remove(role);
      else if (reactUsers.has(user.id) && !user.roles.cache.has(role.id))
        user.roles.add(role);
    };

    /** @type {Map<Discord.MessageReaction, Collection<string, Discord.User>>} */
    var reactUserMap = new Map();

    await Promise.all(
      validReactions.map(async (r) => {
        try {
          var users = await r.users.fetch();
          reactUserMap.set(r, users);
        } catch (error) {
          console.log(error);
        }
      })
    );

    const guildUsers = guild.members.cache;
    guildUsers.forEach((gUser, userID) => {
      if (gUser.user.bot) return;
      //console.log("Usuario " + gUser.user.username);
      validReactions.forEach((r) => {
        var idToUse = r.emoji.id != null ? r.emoji.id : r.emoji.name;
        //console.log(guildRoles.get(reactionMessageObject.reactionMap.get(idToUse)).name);
        processUser(
          gUser,
          guildRoles.get(reactionMessageObject.reactionMap.get(idToUse)),
          reactUserMap.get(r)
        );
      });
    });
  },
};
