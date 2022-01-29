"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed } = require("discord.js");
const Guild = require("../../models/logs")

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

/**
 * Runs ping command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) =>
{
    try
    {
        const target = interaction.options.getMember("target")
        const reason = interaction.options.getString('reason') || "No reason provided";

        if(!target) return interaction.reply({ content: "This User is invalid"})

        let kickdm = new MessageEmbed()
        .setColor("RED")
        .setDescription(`You have been kicked from **${interaction.guild.name}**.\nReason: ${reason}`)
        await target.send({ embeds: [kickdm] });

           target.kick({ target });

        let kickmsg = new MessageEmbed()
        .setColor("GREEN")
        .setTitle(`${target.user.tag} Kicked`)
        .setDescription(`Kicked ${target.user.tag} from ${interaction.guild.name}.\nReason: ${reason}`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage(interaction.guild.iconURL({ dynamic: true }))

        const logs = new MessageEmbed()
        .setTitle("✅ | Member kicked")
        .setDescription(`Kicked ${target.user.tag}\nModerator: ${interaction.user.tag}\nReason: ${reason}`)
        .setColor("GREEN")
        .setTimestamp()
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage(interaction.guild.iconURL({ dynamic: true }))


        const guildQuery = await Guild.findOne({ id: interaction.guild.id });
        if (guildQuery) {
          const guild = interaction.client.guilds.cache.get(
            interaction.guild.id
          );
          const logging = guild.channels.cache.get(guildQuery.channel);
          logging.send({ embeds: [logs] });
        } else if (!guildQuery) {
          return;
        }

        await interaction.reply({ embeds: [kickmsg], ephemeral: true });
        return;
    }
    catch (err)
    {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.ADMINISTRATOR],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR]
};

module.exports.data = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(option => option.setName("target").setDescription("Select the User to kick").setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription("Provide a Reason to kick").setRequired(true))