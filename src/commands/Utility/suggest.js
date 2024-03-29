"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed } = require("discord.js");

// Database queries
const Guild = require("../../models/Suggestions/suggestions");
const User = require("../../models/Suggestions/usersuggestions");

// Configs
const emojis = require("../../../Controller/emojis/emojis");

module.exports.cooldown = {
    length: 320000, /* in ms */
    users: new Set()
};

// generate random ID
function generateID() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

/**
 * Runs the command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction) =>
{
    try
    {
    
        const guildQuery = await Guild.findOne({ id: interaction.guild.id })
        if(!guildQuery) return interaction.reply({ content: `${emojis.error} | This guild has **no** suggestion system setup.`, ephemeral: true })
        
        const suggestion = interaction.options.getString("suggestion")
        const pin = generateID();
        const user = interaction.user;

        if(suggestion.length >= 150) return interaction.reply({ content: `${emojis.error} | Description must be less than **150** characters.`, ephemeral: true })

        const embed = new MessageEmbed()
        .setTitle(`${emojis.notify} New Suggestion`)
        .setDescription(`${suggestion}\n\n📊 Waiting for the community to vote!\n🕴 By ${interaction.user.tag}`)
        .setTimestamp()
        .setFooter({ text: `Pin: ${pin}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor("#36393F")

        if(guildQuery) {
            const guild = interaction.client.guilds.cache.get(interaction.guild.id);
            const suggestionchannel = guild.channels.cache.get(guildQuery.channel);
            const message = await suggestionchannel.send({ embeds: [embed] }); 

            const userSuggestion = new User({
                userID: interaction.user.id,
                suggestion: suggestion,
                message: message.id,
                pin: pin
            })
            userSuggestion.save();

            await message.react(`${emojis.success}`)
            await message.react(`${emojis.error}`)

            interaction.reply({ content: `${emojis.success} | Successfully sent suggestion.`, ephemeral: true, fetchReply: true });
        }
    }
    catch (err)
    {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.SEND_MESSAGES]
};

module.exports.data = new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest some Ideas for the Server.")
    .addStringOption(option => option.setName("suggestion").setDescription("What would you like to suggest?").setRequired(true))
