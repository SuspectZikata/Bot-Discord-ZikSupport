const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
const Lottery = require('../models/Lottery');
const User = require('../models/User');

const TIMEZONE = 'America/Sao_Paulo';

module.exports = {
  name: 'ready',
  once: true,

  execute: async (client) => {
    console.log(`[Loteria] Sistema iniciado (${TIMEZONE})`);

    // Verifica sorteios pendentes ao iniciar
    await checkPendingDraws(client);

    // Agendador principal (verifica a cada minuto)
    cron.schedule('* * * * *', async () => {
      await checkScheduledDraws(client);
    }, { timezone: TIMEZONE });
  }
};

async function checkPendingDraws(client) {
  const lotteries = await Lottery.find({
    enabled: true,
    $or: [
      { lastDrawDate: { $exists: false } },
      { lastDrawDate: { $lt: moment().tz(TIMEZONE).subtract(23, 'hours').toDate() } }
    ],
    $expr: { $gt: [{ $size: "$currentEntries" }, 0] }
  });

  for (const lottery of lotteries) {
    console.log(`[Loteria] Processando sorteio pendente para ${lottery.guildId}`);
    await executeLotteryDraw(client, lottery);
  }
}

async function checkScheduledDraws(client) {
  const now = moment().tz(TIMEZONE);
  const currentTime = now.format('HH:mm');

  const lotteries = await Lottery.find({
    enabled: true,
    drawTime: currentTime
  });

  for (const lottery of lotteries) {
    if (lottery.lastDrawDate && 
        moment(lottery.lastDrawDate).tz(TIMEZONE).isSame(now, 'day')) {
      continue;
    }

    console.log(`[Loteria] Iniciando sorteio programado para ${lottery.guildId}`);
    await executeLotteryDraw(client, lottery);
  }
}

async function executeLotteryDraw(client, lottery) {
  const now = moment().tz(TIMEZONE);

  try {
    lottery.lastDrawAttempt = now.toDate();
    await lottery.save();

    if (lottery.currentEntries.length === 0) {
      return; // Nada a fazer sem participantes
    }

    // Prepara lista para sorteio
    const entries = lottery.currentEntries.flatMap(entry => 
      Array(entry.tickets).fill(entry.userId)
    );

    // Sorteia o vencedor
    const winnerId = entries[Math.floor(Math.random() * entries.length)];
    const winner = await User.findOne({ userId: winnerId }) || 
                  new User({ userId: winnerId });
    
    // Adiciona o prêmio
    await winner.addPrize(lottery.jackpot);

    // Atualiza os dados da loteria
    lottery.lastWinner = {
      userId: winnerId,
      prize: lottery.jackpot,
      date: now.toDate()
    };
    lottery.lastDrawDate = now.toDate();
    lottery.jackpot = 0;
    lottery.currentEntries = [];
    await lottery.save();

    // Envia mensagem no canal
    if (lottery.channelId) {
      const channel = await client.channels.fetch(lottery.channelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle(`🎉 Loteria Diária - ${now.format('DD/MM/YYYY')}`)
          .setDescription(`**<@${winnerId}>** ganhou **⭐ ${lottery.lastWinner.prize} estrelas**!`)
          .addFields(
            { name: 'Bilhetes vendidos', value: `${entries.length}`, inline: true },
            { name: 'Participantes', value: `${new Set(entries).size}`, inline: true },
            { name: 'Próximo sorteio', value: `Amanhã às ${lottery.drawTime}`, inline: false }
          )
          .setFooter({ text: 'Sorteio automático' });

        await channel.send({ embeds: [embed] });
      }
    }

    console.log(`[Loteria] Sorteio concluído para ${lottery.guildId} | Vencedor: ${winnerId}`);

  } catch (error) {
    console.error(`[Loteria] Erro durante sorteio para ${lottery.guildId}:`, error);
    
    // Notifica sobre o erro
    if (lottery.channelId) {
      const channel = await client.channels.fetch(lottery.channelId).catch(() => null);
      if (channel) {
        await channel.send({
          content: '⚠️ Ocorreu um erro durante o sorteio automático. O sistema tentará novamente.',
          flags: [4096] // Ephemeral
        });
      }
    }
  }
}