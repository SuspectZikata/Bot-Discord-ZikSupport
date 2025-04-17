const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../../models/Giveaway');
const { endGiveaway } = require('../../utils/giveawayUtils');

module.exports = {
  name: 'sorteio-adiantar',
  description: '⏩ Finaliza um sorteio antecipadamente',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'id',
      description: 'ID do sorteio a finalizar',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  async run(client, interaction) {
    const giveaway = await Giveaway.findOne({
      _id: interaction.options.getString('id'),
      guildId: interaction.guildId,
      status: 'active'
    });

    if (!giveaway) {
      return interaction.reply({
        content: '❌ Sorteio não encontrado ou já encerrado.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Finaliza o sorteio
    await endGiveaway(client, giveaway);

    await interaction.reply({
      content: `✅ Sorteio "${giveaway.title}" finalizado antecipadamente!`,
      flags: MessageFlags.Ephemeral
    });
  }
};