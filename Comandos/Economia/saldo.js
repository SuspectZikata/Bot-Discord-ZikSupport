const { EmbedBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'saldo',
  description: 'Veja seu saldo atual de estrelas',
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;

      let user = await User.findOne({ userId });
      if (!user) {
        user = new User({ userId, stars: 0 });
        await user.save();
      }

      const embed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle(`💰 Saldo de Estrelas`)
        .setDescription(`Você tem **${user.stars}** estrelas ✨`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Solicitado por ${username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

      await interaction.reply({
        embeds: [embed]
      });

    } catch (error) {
      // Silencia o erro, se preferir
      // console.error('Erro no comando saldo:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao verificar seu saldo.',
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
    }
  }
};
