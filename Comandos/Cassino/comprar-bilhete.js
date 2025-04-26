const { EmbedBuilder, MessageFlags } = require('discord.js');
const Lottery = require('../../models/Lottery');
const User = require('../../models/User');

module.exports = {
  name: 'comprar-bilhete',
  description: 'Compre bilhetes para a loteria diária',
  type: 1,
  options: [
    {
      name: 'quantidade',
      description: 'Quantidade de bilhetes',
      type: 4, // Integer
      required: true,
      min_value: 1,
      max_value: 20
    }
  ],

  run: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral});

    const quantity = interaction.options.getInteger('quantidade');

    try {
      const lottery = await Lottery.findOne({ guildId: interaction.guild.id });
      if (!lottery || !lottery.enabled) {
        return interaction.editReply('❌ A loteria não está ativa neste servidor!');
      }

      let user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        user = new User({ userId: interaction.user.id });
      }

      const totalCost = quantity * lottery.ticketPrice;

      // Verifica saldo antes de tentar comprar
      if (user.stars < totalCost) {
        return interaction.editReply('❌ Você não tem estrelas suficientes!');
      }

      await user.buyLotteryTickets(quantity, lottery.ticketPrice);

      // Atualiza o prêmio acumulado e entradas
      lottery.jackpot += totalCost;

      const existingEntry = lottery.currentEntries.find(entry => entry.userId === interaction.user.id);
      if (existingEntry) {
        existingEntry.tickets += quantity;
      } else {
        lottery.currentEntries.push({
          userId: interaction.user.id,
          tickets: quantity
        });
      }

      await lottery.save();

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎟️ Bilhetes Comprados')
        .setDescription(`Você comprou ${quantity} bilhete(s) para a loteria diária!`)
        .addFields(
          { name: 'Custo total', value: `${totalCost} estrelas`, inline: true },
          { name: 'Seu saldo', value: `${user.stars} estrelas`, inline: true },
          { name: 'Prêmio acumulado', value: `${lottery.jackpot} estrelas`, inline: true }
        )
        .setFooter({ text: `Sorteio às ${lottery.drawTime} (horário de Brasília)` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao comprar bilhete:', error);
      await interaction.editReply('❌ Ocorreu um erro ao comprar bilhetes!');
    }
  }
};
