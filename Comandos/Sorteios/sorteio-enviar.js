const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../../models/Giveaway');
const mongoose = require('mongoose');

module.exports = {
  name: 'sorteio-enviar',
  description: '📤 Publica um sorteio criado',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'id',
      description: 'ID do sorteio (use /sorteio-listar para ver IDs)',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'canal',
      description: 'Canal para enviar o sorteio',
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [0]
    }
  ],

  async run(client, interaction) {
    // Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(interaction.options.getString('id'))) {
      return interaction.reply({
        content: '❌ ID inválido! Use /sorteio-listar para ver os sorteios disponíveis.',
        flags: MessageFlags.Ephemeral
      });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const giveaway = await Giveaway.findById(interaction.options.getString('id'));

    if (!giveaway || giveaway.status !== 'pending') {
      return interaction.reply({
        content: '❌ Sorteio não encontrado ou já publicado.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(giveaway.title)
      .setDescription(`**Prêmio:** ${giveaway.prize}\n\nClique no botão abaixo para participar!`)
      .addFields(
        { name: '⏳ Encerra em', value: `<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`, inline: true },
        { name: '🎁 Vencedores', value: `${giveaway.winnerCount}`, inline: true },
        { name: '👥 Participantes', value: '0', inline: true }
      )
      .setFooter({ text: `Host: ${giveaway.hostUsername}` });

    if (giveaway.imageUrl) embed.setImage(giveaway.imageUrl);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${giveaway._id}`) // ID único para cada sorteio
        .setLabel('Participar')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎉')
    );

    const message = await channel.send({
      content: '🎉 **NOVO SORTEIO** 🎉',
      embeds: [embed],
      components: [row]
    });

    giveaway.messageId = message.id;
    giveaway.channelId = channel.id;
    giveaway.status = 'active';
    await giveaway.save();

    await interaction.reply({
      content: `✅ Sorteio publicado em ${channel}!`,
      flags: MessageFlags.Ephemeral
    });
  }
};