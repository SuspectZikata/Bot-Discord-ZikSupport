const Discord = require('discord.js');
const { MessageFlags } = require("discord.js");
const User = require('../../models/User');

module.exports = {
  name: 'daily',
  description: 'Receba suas estrelas diárias!',
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    try {
      // Verificar ou criar usuário no banco de dados
      let user = await User.findOne({ userId: interaction.user.id });
      
      if (!user) {
        user = new User({ userId: interaction.user.id });
        await user.save();
      }

      // Verificar se já usou o daily hoje
      const now = new Date();
      const lastDaily = user.lastDaily;
      
      if (lastDaily) {
        const lastDailyDate = new Date(lastDaily);
        const isSameDay = lastDailyDate.getDate() === now.getDate() && 
                         lastDailyDate.getMonth() === now.getMonth() && 
                         lastDailyDate.getFullYear() === now.getFullYear();
        
        if (isSameDay) {
          const nextDaily = new Date(lastDailyDate);
          nextDaily.setDate(nextDaily.getDate() + 1);
          nextDaily.setHours(0, 0, 0, 0);
          
          const timeLeft = nextDaily - now;
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          return interaction.reply({
            content: `Você já coletou suas estrelas diárias hoje! Volte amanhã ou em ${hoursLeft} horas e ${minutesLeft} minutos.`,
            flags: MessageFlags.Ephemeral
          });
        }
      }

      // Dar recompensa diária
      const starsEarned = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;
      user.stars += starsEarned;
      user.lastDaily = now;
      await user.save();

      // Responder ao usuário
      const embed = new Discord.EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🌟 Recompensa Diária 🌟')
        .setDescription(`Você recebeu ${starsEarned} estrelas!`)
        .addFields(
          { name: 'Seu saldo atual', value: `${user.stars} estrelas`, inline: true }
        )
        .setFooter({ text: 'Volte amanhã para mais estrelas!' });

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Erro no comando daily:', error);
      await interaction.reply({
        content: 'Ocorreu um erro ao processar seu pedido diário.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};