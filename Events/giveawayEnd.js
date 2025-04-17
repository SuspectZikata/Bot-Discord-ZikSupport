const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway');

module.exports = async (client) => {
  try {
    const activeGiveaways = await Giveaway.find({ 
      ended: false,
      endTime: { $lte: new Date() }
    });

    for (const giveaway of activeGiveaways) {
      const channel = await client.channels.fetch(giveaway.channelId);
      if (!channel) continue;

      const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!message) continue;

      // Seleciona vencedores
      const winners = selectWinners(giveaway.participants, giveaway.winnerCount);
      
      // Atualiza o sorteio no banco de dados
      giveaway.winners = winners.map(user => ({
        userId: user.userId,
        username: user.username
      }));
      giveaway.ended = true;
      await giveaway.save();

      // Atualiza a mensagem do sorteio
      const embed = EmbedBuilder.from(message.embeds[0])
        .setColor('#FF0000')
        .setTitle(`${giveaway.title} (ENCERRADO)`)
        .setDescription(`**Prêmio:** ${giveaway.prize}\n\nSorteio encerrado!`)
        .spliceFields(0, 4, [
          { name: '🎁 Vencedores', value: winners.map(u => `<@${u.userId}>`).join(', ') || 'Nenhum participante' },
          { name: '👥 Participantes', value: `${giveaway.participants.length}`, inline: true }
        ]);

      await message.edit({
        embeds: [embed],
        components: []
      });

      // Anuncia os vencedores
      const winnersText = winners.length > 0 
        ? `🎉 Parabéns ${winners.map(u => `<@${u.userId}>`).join(', ')}! Vocês ganharam **${giveaway.prize}**!`
        : 'ℹ️ Nenhum participante para este sorteio.';

      await channel.send({
        content: `**Sorteio Encerrado: ${giveaway.title}**\n${winnersText}\n\nObrigado a todos que participaram!`,
        reply: { messageReference: message.id }
      });
    }
  } catch (error) {
    console.error('Erro ao finalizar sorteios:', error);
  }
};

function selectWinners(participants, winnerCount) {
  if (participants.length === 0) return [];
  
  // Cria uma cópia do array para não modificar o original
  const shuffled = [...participants];
  
  // Embaralha os participantes
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Retorna os primeiros N vencedores
  return shuffled.slice(0, Math.min(winnerCount, shuffled.length));
}