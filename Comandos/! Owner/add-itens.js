const Discord = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background } = require('../../models/ShopItems');

// SEU ID DO DISCORD - Substitua pelo seu ID real
const ADMIN_ID = '406857514639163393'; 

module.exports = {
  name: 'add-itens',
  description: '[OWNER] Adiciona itens na DataBase',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'tipo',
      description: 'Tipo de item',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Cargo', value: 'role' },
        { name: 'Plano de Fundo', value: 'background' }
      ]
    },
    {
      name: 'nome',
      description: 'Nome do item',
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'imagem',
      description: 'URL da imagem/ícone',
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'preco',
      description: 'Preço em estrelas',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 0
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
    const image = interaction.options.getString('imagem');
    const price = interaction.options.getInteger('preco');

    try {
      let item;
      
      if (type === 'role') {
        item = new Role({ name, icon: image, price });
      } else {
        item = new Background({ name, imageUrl: image, price });
      }

      await item.save();

      const embed = new Discord.EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Item adicionado com sucesso!')
        .addFields(
          { name: 'Tipo', value: type === 'role' ? 'Cargo' : 'Plano de Fundo', inline: true },
          { name: 'Nome', value: name, inline: true },
          { name: 'Preço', value: `${price} estrelas`, inline: true }
        )
        .setThumbnail(image)
        .setFooter({ text: `Adicionado por ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao adicionar o item!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};