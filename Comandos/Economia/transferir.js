const Discord = require('discord.js');
const { MessageFlags } = require("discord.js");
const User = require('../../models/User');

module.exports = {
  name: 'transferir',
  description: 'Transfira estrelas para outro usuário sem taxas',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Quem receberá as estrelas',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'quantidade',
      description: 'Quantidade de estrelas para transferir',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1
    }
  ],

  run: async (client, interaction) => {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const recipient = interaction.options.getUser('usuário');
      const amount = interaction.options.getInteger('quantidade');

      if (recipient.bot) {
        return interaction.editReply('❌ Você não pode transferir estrelas para bots!');
      }

      if (recipient.id === interaction.user.id) {
        return interaction.editReply('❌ Você não pode transferir estrelas para si mesmo!');
      }

      const sender = await User.findOne({ userId: interaction.user.id });
      let receiver = await User.findOne({ userId: recipient.id });

      if (!sender) {
        return interaction.editReply('❌ Seu perfil não foi encontrado!');
      }

      if (!receiver) {
        receiver = new User({ userId: recipient.id });
        await receiver.save();
      }

      if (sender.stars < amount) {
        return interaction.editReply(`❌ Saldo insuficiente! Você tem apenas ${sender.stars} estrelas.`);
      }

      sender.stars -= amount;
      receiver.stars += amount;

      await Promise.all([sender.save(), receiver.save()]);

      // Responde privadamente que a transferência foi concluída (caso queira manter isso também)
      await interaction.editReply('✅ Transferência concluída com sucesso!');

      // Mensagem pública visível a todos
      const embed = new Discord.EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle('✨ Transferência Concluída')
        .setDescription(`${interaction.user} transferiu ${amount} estrelas para ${recipient}`)
        .addFields(
          { name: 'Seu novo saldo', value: `${sender.stars} estrelas`, inline: true },
          { name: 'Saldo do destinatário', value: `${receiver.stars} estrelas`, inline: true }
        )
        .setFooter({ text: 'Estrelas da Zik • Transferência Segura 🏧' });

      await interaction.followUp({ embeds: [embed] }); // Mensagem pública

    } catch (error) {
      console.error('Erro no comando transferir:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('❌ Ocorreu um erro ao processar a transferência.');
      } else {
        await interaction.reply({ content: '❌ Ocorreu um erro ao processar a transferência.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
