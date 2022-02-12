"use strict";

const { GuildMember, MessageEmbed, WebhookClient } = require("discord.js");
const ms = require("moment");

// Database queries
const Guild = require("../models/Moderation/antiscam");
const Logs = require("../models/logs");

// Configs
const emojis = require("../../Controller/emojis/emojis");

const {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  Discord,
  ReactionUserManager,
} = require("discord.js");

module.exports.data = {
  name: "messageCreate",
  once: false,
};

/**
 * Handle the clients event.
 * @param {GuildMember} member The client that triggered the event.
 * @param {CommandInteraction} interaction The Command Interaciton
 */

module.exports.run = async (message) => {
  try {
    const check = await Guild.findOne({ id: message.guildId });
    const array = require("../Data/scam.json");

    // If the Guild has no setup done, dont do anything/ignore it.
    if (!check) return;

    if (check) {
      //  if(message.author.bot) return;
      if (array.some((word) => message.content.toLowerCase().includes(word))) {
        message.delete();

        const embed = new MessageEmbed()
          .setTitle(`${emojis.error} Scam detected`)
          .setColor("#ff0000")
          .setDescription(
            `${
              message.author.tag
            } sent a scam link/said a bad word: ||${message.content.toLowerCase()}||`
          )
          .setFooter({
            text: `From ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          });

        // Logging the message into the guild logs
        const guildQuery = await Logs.findOne({ id: message.guild.id });
        if (!guildQuery) return;

        if (guildQuery) {
          // Sending message if scam gets logged
          const webhookid = guildQuery.webhookid;
          const webhooktoken = guildQuery.webhooktoken;

          const webhookClient = new WebhookClient({
            id: webhookid,
            token: webhooktoken,
          });

          webhookClient.send({ embeds: [embed] });
        }

        // Timeout the User after sending the word.
        const member = message.guild.members.cache.get(message.author);
        const timeout = await message.member.timeout(43200000);

        const embed2 = new MessageEmbed()
          .setTitle(`${emojis.error} Scam detected`)
          .setDescription(
            `Dear ${
              message.author.tag
            }\nYou have received this message because you sent a blocked message.\nServer: **${
              message.guild.name
            }**\nMessage: ||${message.content.toLowerCase()}||\n\nYour timeout will be removed automatically in exactly **12 Hours**.`
          )
          .setColor("RED")
          .setFooter({
            text: `Sent to ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        message.author.send({ embeds: [embed2] });
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
