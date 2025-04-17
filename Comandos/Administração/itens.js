const Discord = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background } = require('../../models/ShopItems');

module.exports = {
  name: 'itens',
  description: '[ADMIN] Lista todos os itens disponíveis',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'tipo',
      description: 'Tipo de item',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Cargos', value: 'roles' },
        { name: 'Planos de Fundo', value: 'backgrounds' }
      ]
    }
  ],
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    try {
      const type = interaction.options.getString('tipo');
      const isRoles = type === 'roles';
      
      const items = isRoles 
        ? await Role.find().sort({ price: 1 }) 
        : await Background.find().sort({ price: 1 });

      if (items.length === 0) {
        return interaction.reply({
          content: `❌ Nenhum ${isRoles ? 'cargo' : 'plano de fundo'} disponível!`,
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = new Discord.EmbedBuilder()
        .setColor(isRoles ? '#5865F2' : '#EB459E')
        .setTitle(isRoles ? '🛒 Cargos Disponíveis' : '🎨 Planos de Fundo')
        .setDescription(`Total: ${items.length} itens`);

      items.forEach(item => {
        embed.addFields({
          name: `${item.name} - ${item.price} estrelas`,
          value: `[Ver imagem](${isRoles ? item.icon : item.imageUrl})`,
          inline: true
        });
      });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao listar itens:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao listar os itens!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};