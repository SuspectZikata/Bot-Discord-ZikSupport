const Discord = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background } = require('../../models/ShopItems');

const ADMIN_ID = '406857514639163393'; // Mantenha seu ID aqui

module.exports = {
  name: 'rem-itens',
  description: '[OWNER] Remove itens da DataBase',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'tipo',
      description: 'Tipo de item a ser removido',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Cargo', value: 'role' },
        { name: 'Plano de Fundo', value: 'background' }
      ]
    },
    {
      name: 'nome',
      description: 'Nome exato do item a ser removido',
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    }
  ],
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    // Verifica se é o administrador
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({
        content: '❌ Apenas o desenvolvedor pode usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }

    const type = interaction.options.getString('tipo');
    const name = interaction.options.getString('nome');

    try {
      const Model = type === 'role' ? Role : Background;
      const item = await Model.findOneAndDelete({ name });

      if (!item) {
        return interaction.reply({
          content: `❌ ${type === 'role' ? 'Cargo' : 'Plano de fundo'} não encontrado na database!`,
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Item removido permanentemente!')
        .addFields(
          { name: 'Tipo', value: type === 'role' ? 'Cargo' : 'Plano de Fundo', inline: true },
          { name: 'Nome', value: item.name, inline: true },
          { name: 'Preço', value: `${item.price} estrelas`, inline: true }
        )
        .setThumbnail(type === 'role' ? item.icon : item.imageUrl)
        .setFooter({ text: `Removido por ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao remover item:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao remover o item!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};