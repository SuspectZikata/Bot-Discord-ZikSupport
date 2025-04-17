const { Events, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../models/Giveaway');
const mongoose = require('mongoose');

module.exports = {
  name: Events.InteractionCreate,
  
  async execute(interaction) {
    // Verifica se é um botão de participação
    if (!interaction.isButton() || !interaction.customId?.startsWith('giveaway_join_')) return;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const giveawayId = interaction.customId.split('_')[2];
      
      // Verifica se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
        return interaction.editReply({
          content: '❌ Sorteio inválido!',
          flags: MessageFlags.Ephemeral
        });
      }

      const giveaway = await Giveaway.findOne({
        _id: giveawayId,
        status: 'active'
      });

      if (!giveaway) {
        return interaction.editReply({
          content: '❌ Sorteio não encontrado ou encerrado.',
          flags: MessageFlags.Ephemeral
        });
      }

      const user = interaction.user;
      
      // Verifica se já está participando
      const existingParticipant = giveaway.participants.find(p => p.userId === user.id);
      if (existingParticipant) {
        return interaction.editReply({
          content: '⚠️ Você já está participando deste sorteio!',
          flags: MessageFlags.Ephemeral
        });
      }

      // Verifica requisitos de cargo
      if (giveaway.requiredRoles?.length > 0) {
        const member = await interaction.guild.members.fetch(user.id);
        const hasRequiredRole = giveaway.requiredRoles.some(roleId => 
          member.roles.cache.has(roleId)
        );

        if (!hasRequiredRole) {
          const rolesMention = giveaway.requiredRoles.map(r => `<@&${r}>`).join(' ou ');
          return interaction.editReply({
            content: `❌ Você precisa do(s) cargo(s) ${rolesMention} para participar.`,
            flags: MessageFlags.Ephemeral
          });
        }
      }

      // Adiciona o participante
      giveaway.participants.push({
        userId: user.id,
        username: user.username,
        joinedAt: new Date()
      });

      await giveaway.save();

      // Atualiza o embed
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = new EmbedBuilder(originalEmbed.toJSON());
      
      // Atualiza o campo de participantes
      updatedEmbed.spliceFields(
        updatedEmbed.data.fields.findIndex(f => f.name === '👥 Participantes'),
        1,
        { name: '👥 Participantes', value: `${giveaway.participants.length}`, inline: true }
      );

      // Atualiza a mensagem
      await interaction.message.edit({ 
        embeds: [updatedEmbed] 
      });

      await interaction.editReply({
        content: '🎉 Você entrou no sorteio com sucesso! Boa sorte!',
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('Erro na participação do sorteio:', error);
      
      const errorResponse = {
        content: '❌ Ocorreu um erro ao processar sua participação.',
        flags: MessageFlags.Ephemeral
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorResponse);
      } else {
        await interaction.reply(errorResponse);
      }
    }
  }
};