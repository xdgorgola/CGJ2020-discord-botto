const Discord = require("discord.js");
const fs = require("fs");

const conf = require("../resources/config.json");
const userJoinRuleEvent = require("../events/joinUserEvent.js");

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

  /**
   * Lee el contenido de un archivo y lo retorna como texto
   * @param {*} path
   * @param {*} defaultContent contenido a retornar por defecto
   * @returns Contenido del archivo como texto
   */
  async fileToText(path, defaultContent) {
    var fileContent = defaultContent;

    try {
      var prom = await fs.promises.readFile(path, {
        encoding: "utf8",
        flag: "r",
      });
      fileContent = prom.toString();
    } catch (error) {
      if (error.code != "ENOENT") throw error;
    }

    return fileContent;
  },

  /**
   * @summary Inicializa el mensaje de bienvenida del bot
   * @param {Discord.Client} client Cliente de Discord
   * @param {string} welcomeMessage Mensaje inicial de bienvenida (por defecto)
   */
  async initWelcomeMessageEvent(client, welcomeMessage) {
    await this.fileToText(conf.welcome_path, welcomeMessage)
      .then((fileContent) => {
        welcomeMessage = fileContent;
      })
      .catch((err) =>
        this.logMessage("main", `No se pudo inicializar mensaje de bienvenida por: ${err}`)
      );

    userJoinRuleEvent.welcomeMessageEvent(client, welcomeMessage);
  },

  /**
   * Envía un mensaje a una serie de usuarios admins
   * @param {[Discord.GuildMember]} admins Colección de admins
   * @param {string} message Mensaje a enviar
   */
  async messageAdmins(admins, message) {
    const maxAttemptsPerAdmin = 4;
    var couldReachAnAdmin = false;

    this.logMessage("messageAdmins", `Intentando contactar a los admins ${admins}`);
    admins.forEach(async (guildMember) => {
      this.logMessage(`Intentando contactar a ${guildMember.user.tag}`);
      if (guildMember === null) return;

      var messageSent = false;
      for (var i = 0; i < maxAttemptsPerAdmin && !messageSent; i++) {
        messageSent = true;
        await guildMember.send(message).catch(() => {
          this.logMessage(
            "messageAdmins",
            `No se pudo enviar mensaje a admin ${guildMember.user.tag}, intento ${i + 1}`
          );
          messageSent = false;
        });

        // Waiting before the next attempt
        if (!messageSent) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          couldReachAnAdmin = true;
        }
      }
    });

    if (!couldReachAnAdmin) {
      this.logMessage(
        "admin",
        `No se pudo contactar a NINGÚN ADMIN por el siguiente mensaje: ${message}.`
      );
    }
  },
};
