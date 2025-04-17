const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name: 'sorteio-listar',
  description: '📋 Lista todos os sorteios pendentes',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  async run(client, interaction) {
    const giveaways = await Giveaway.find({
      guildId: interaction.guildId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (giveaways.length === 0) {
      return interaction.reply({
        content: 'ℹ️ Não há sorteios pendentes.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📋 Sorteios Pendentes')
      .setDescription('Lista de sorteios que ainda não foram publicados:');

    giveaways.forEach(giveaway => {
      embed.addFields({
        name: `${giveaway.title} (ID: ${giveaway._id})`,
        value: `Prêmio: ${giveaway.prize}\nVencedores: ${giveaway.winnerCount}\nCriado: <t:${Math.floor(giveaway.createdAt.getTime() / 1000)}:R>`
      });
    });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};