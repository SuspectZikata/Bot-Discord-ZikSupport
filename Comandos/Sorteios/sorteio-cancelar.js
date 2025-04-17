const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../../models/Giveaway');
const mongoose = require('mongoose');

module.exports = {
  name: 'sorteio-cancelar',
  description: '❌ Cancela um sorteio e exclui permanentemente',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'id',
      description: 'ID do sorteio a cancelar',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  async run(client, interaction) {
    const giveawayId = interaction.options.getString('id');

    if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
      return interaction.reply({
        content: '❌ ID inválido! Use `/sorteio-listar` para ver os IDs disponíveis.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      // Encontra e deleta o sorteio em uma única operação
      const deletedGiveaway = await Giveaway.findOneAndDelete({
        _id: giveawayId,
        guildId: interaction.guildId
      });

      if (!deletedGiveaway) {
        return interaction.reply({
          content: '❌ Sorteio não encontrado ou já foi encerrado/excluído!',
          flags: MessageFlags.Ephemeral
        });
      }

      // Atualiza a mensagem do sorteio no Discord
      try {
        const channel = await client.channels.fetch(deletedGiveaway.channelId);
        if (channel) {
          const message = await channel.messages.fetch(deletedGiveaway.messageId).catch(() => null);
          if (message) {
            const embed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle(`${deletedGiveaway.title} (CANCELADO)`)
              .setDescription('**Este sorteio foi cancelado e removido**')
              .addFields(
                { name: 'Prêmio', value: deletedGiveaway.prize },
                { name: 'Status', value: 'Cancelado pelo host' }
              );

            await message.edit({
              embeds: [embed],
              components: []
            });
          }
        }
      } catch (discordError) {
        console.error('Erro ao atualizar mensagem do sorteio:', discordError);
      }

      await interaction.reply({
        content: `✅ Sorteio "${deletedGiveaway.title}" foi cancelado e excluído permanentemente!`,
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('Erro ao cancelar sorteio:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao cancelar o sorteio.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};