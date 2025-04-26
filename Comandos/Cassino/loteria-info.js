const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const Lottery = require('../../models/Lottery');

const TIMEZONE = 'America/Sao_Paulo';

module.exports = {
  name: 'loteria-info',
  description: 'Veja informações sobre a loteria atual',
  type: 1,

  run: async (client, interaction) => {
    await interaction.deferReply();

    try {
      const lottery = await Lottery.findOne({ guildId: interaction.guild.id });
      if (!lottery || !lottery.enabled) {
        return interaction.editReply('ℹ️ A loteria não está ativa neste servidor.');
      }

      const now = moment().tz(TIMEZONE);
      const nextDraw = moment.tz(lottery.drawTime, 'HH:mm', TIMEZONE);
      if (now.isAfter(nextDraw)) nextDraw.add(1, 'day');

      const uniqueParticipants = new Set(lottery.currentEntries.map(e => e.userId)).size;
      const totalTickets = lottery.currentEntries.reduce((sum, e) => sum + e.tickets, 0);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎟️ Status da Loteria Diária')
        .addFields(
          { name: 'Preço do bilhete', value: `${lottery.ticketPrice} estrelas`, inline: true },
          { name: 'Prêmio acumulado', value: `${lottery.jackpot} estrelas`, inline: true },
          { name: 'Bilhetes vendidos', value: `${totalTickets}`, inline: true },
          { name: 'Participantes', value: `${uniqueParticipants}`, inline: true },
          { name: 'Horário do sorteio', value: lottery.drawTime, inline: true },
          { name: 'Próximo sorteio', value: nextDraw.format('DD/MM/YYYY [às] HH:mm'), inline: true }
        );

      if (lottery.lastWinner) {
        const lastDraw = moment(lottery.lastWinner.date).tz(TIMEZONE);
        embed.addFields({
          name: 'Último vencedor',
          value: `<@${lottery.lastWinner.userId}> ganhou ${lottery.lastWinner.prize} estrelas em ${lastDraw.format('DD/MM/YYYY')}`,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao mostrar info da loteria:', error);
      await interaction.editReply('❌ Ocorreu um erro ao buscar informações!');
    }
  }
};