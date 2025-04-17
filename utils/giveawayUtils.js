const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function endGiveaway(client, giveaway) {
  try {
    // 1. Busca o canal e a mensagem
    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) {
      await Giveaway.findByIdAndDelete(giveaway._id);
      return;
    }

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) {
      await Giveaway.findByIdAndDelete(giveaway._id);
      return;
    }

    // 2. Seleciona os vencedores
    const winners = selectWinners(giveaway.participants, giveaway.winnerCount);

    // 3. Cria o embed de encerramento
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`${giveaway.title} (ENCERRADO)`)
      .setDescription(`**Prêmio:** ${giveaway.prize}\n\nSorteio encerrado!`)
      .addFields(
        { 
          name: '🎁 Vencedores', 
          value: winners.length ? winners.map(u => `<@${u.userId}>`).join(', ') : 'Nenhum participante',
          inline: false 
        },
        { 
          name: '👥 Participantes', 
          value: `${giveaway.participants.length}`, 
          inline: true 
        }
      )
      .setFooter({ text: `Host: ${giveaway.hostUsername}` });

    if (giveaway.imageUrl) embed.setImage(giveaway.imageUrl);

    // 4. Atualiza a mensagem no Discord
    await message.edit({
      embeds: [embed],
      components: []
    });

    // 5. Anuncia os vencedores
    const winnersText = winners.length > 0 
      ? `🎉 Parabéns ${winners.map(u => `<@${u.userId}>`).join(', ')}! Vocês ganharam **${giveaway.prize}**!`
      : 'ℹ️ Nenhum participante para este sorteio.';

    await channel.send({
      content: `**Sorteio Encerrado: ${giveaway.title}**\n${winnersText}`,
      reply: { messageReference: message.id }
    });

    // 6. Exclui o sorteio da database
    await Giveaway.findByIdAndDelete(giveaway._id);

  } catch (error) {
    console.error('Erro ao finalizar sorteio:', error);
    
    // Tenta excluir mesmo em caso de erro
    try {
      await Giveaway.findByIdAndDelete(giveaway._id);
    } catch (deleteError) {
      console.error('Erro ao excluir sorteio:', deleteError);
    }
    
    throw error;
  }
}

async function cancelGiveaway(client, giveaway) {
  try {
    // 1. Busca o canal e a mensagem
    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    const message = channel ? await channel.messages.fetch(giveaway.messageId).catch(() => null) : null;

    // 2. Atualiza a mensagem no Discord (se existir)
    if (message) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${giveaway.title} (CANCELADO)`)
        .setDescription('**Este sorteio foi cancelado**')
        .addFields(
          { name: 'Prêmio', value: giveaway.prize },
          { name: 'Status', value: 'Cancelado pelo host' }
        );

      await message.edit({
        embeds: [embed],
        components: []
      });
    }

    // 3. Exclui o sorteio da database
    await Giveaway.findByIdAndDelete(giveaway._id);

  } catch (error) {
    console.error('Erro ao cancelar sorteio:', error);
    
    // Tenta excluir mesmo em caso de erro
    try {
      await Giveaway.findByIdAndDelete(giveaway._id);
    } catch (deleteError) {
      console.error('Erro ao excluir sorteio:', deleteError);
    }
    
    throw error;
  }
}

function selectWinners(participants, winnerCount) {
  if (!participants || participants.length === 0) return [];
  
  // Embaralha os participantes
  const shuffled = [...participants].sort(() => 0.5 - Math.random());
  
  // Seleciona os vencedores
  return shuffled.slice(0, Math.min(winnerCount, shuffled.length));
}

module.exports = { 
  endGiveaway,
  cancelGiveaway,
  selectWinners
};