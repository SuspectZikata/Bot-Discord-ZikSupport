const { EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const moment = require('moment-timezone');
const Lottery = require('../../models/Lottery');
const User = require('../../models/User');

const TIMEZONE = 'America/Sao_Paulo';

module.exports = {
  name: 'adiantar-loteria',
  description: '[ADMIN] Executa o sorteio manualmente',
  type: 1,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'forcar',
      description: 'Executar mesmo sem participantes?',
      type: 5, // Boolean
      required: false
    }
  ],

  run: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const force = interaction.options.getBoolean('forcar') || false;
    const now = moment().tz(TIMEZONE);

    try {
      const lottery = await Lottery.findOne({ guildId: interaction.guild.id });
      if (!lottery || !lottery.enabled) {
        return interaction.editReply('❌ A loteria não está ativa neste servidor!');
      }

      if (!force && lottery.currentEntries.length === 0) {
        return interaction.editReply('ℹ️ Não há participantes para sortear hoje!');
      }

      const previousJackpot = lottery.jackpot;
      const participants = new Set(lottery.currentEntries.map(e => e.userId));
      const ticketsSold = lottery.currentEntries.reduce((sum, e) => sum + e.tickets, 0);

      // Sorteia o vencedor
      let winnerId = null;
      if (lottery.currentEntries.length > 0) {
        const entries = lottery.currentEntries.flatMap(e => 
          Array(e.tickets).fill(e.userId)
        );
        winnerId = entries[Math.floor(Math.random() * entries.length)];
        
        // Adiciona o prêmio
        const winner = await User.findOne({ userId: winnerId }) || 
                      new User({ userId: winnerId });
        await winner.addPrize(lottery.jackpot);
      }

      // Atualiza a loteria
      lottery.lastWinner = winnerId ? {
        userId: winnerId,
        prize: previousJackpot,
        date: now.toDate()
      } : null;
      
      lottery.lastDrawDate = now.toDate();
      lottery.lastManualDraw = {
        by: interaction.user.id,
        at: now.toDate()
      };
      lottery.jackpot = 0;
      lottery.currentEntries = [];
      await lottery.save();

      // Envia mensagem no canal
      if (lottery.channelId && winnerId) {
        const channel = await client.channels.fetch(lottery.channelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 Sorteio Adiantado!')
            .setDescription(`**<@${winnerId}>** ganhou **⭐ ${previousJackpot} estrelas**!`)
            .addFields(
              { name: 'Bilhetes vendidos', value: `${ticketsSold}`, inline: true },
              { name: 'Participantes', value: `${participants.size}`, inline: true },
              { name: 'Executado por', value: `<@${interaction.user.id}>`, inline: true }
            )
            .setFooter({ text: `Sorteio manual em ${now.format('DD/MM/YYYY HH:mm')}` });

          await channel.send({ embeds: [embed] });
        }
      }

      // Resposta para o admin
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('⏩ Sorteio Adiantado')
        .setDescription(winnerId ? 
          `✅ Sorteio concluído! <@${winnerId}> ganhou ${previousJackpot} estrelas!` : 
          'ℹ️ Sorteio executado (sem participantes)')
        .addFields(
          { name: 'Próximo sorteio automático', value: now.add(1, 'day').format('DD/MM/YYYY [às] HH:mm'), inline: false }
        );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao adiantar loteria:', error);
      await interaction.editReply('❌ Ocorreu um erro ao executar o sorteio!');
    }
  }
};