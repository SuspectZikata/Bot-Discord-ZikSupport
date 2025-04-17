const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background, UserInventory } = require('../../models/ShopItems');
const User = require('../../models/User');

module.exports = {
  name: 'dar-item',
  description: '[OWNER] Adiciona um item diretamente a um usuário',
  type: 1,
  options: [
    {
      name: 'usuario',
      description: 'Usuário que receberá o item',
      type: 6,
      required: true
    },
    {
      name: 'tipo',
      description: 'Tipo de item',
      type: 3,
      required: true,
      choices: [
        { name: 'Cargo', value: 'role' },
        { name: 'Plano de Fundo', value: 'background' }
      ]
    },
    {
      name: 'nome',
      description: 'Nome exato do item',
      type: 3,
      required: true
    }
  ],
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const ADMIN_ID = '406857514639163393';

    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({
        content: '❌ Apenas o administrador pode usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const targetUser = interaction.options.getUser('usuario');
      const itemType = interaction.options.getString('tipo');
      const itemName = interaction.options.getString('nome');

      // Busca o item no banco de dados
      const Model = itemType === 'role' ? Role : Background;
      const item = await Model.findOne({ name: itemName });

      if (!item) {
        return interaction.reply({
          content: `❌ ${itemType === 'role' ? 'Cargo' : 'Plano de fundo'} não encontrado!`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Verifica se o usuário principal existe
      await User.findOneAndUpdate(
        { userId: targetUser.id },
        { $setOnInsert: { userId: targetUser.id } },
        { upsert: true, new: true }
      );

      // Atualiza o inventário
      const inventory = await UserInventory.findOneAndUpdate(
        { userId: targetUser.id },
        {
          $addToSet: {
            [itemType === 'role' ? 'ownedRoles' : 'ownedBackgrounds']: item._id
          }
        },
        { upsert: true, new: true }
      );

      // Embed de confirmação
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Item adicionado com sucesso!')
        .addFields(
          { name: 'Usuário', value: targetUser.tag, inline: true },
          { name: 'Tipo', value: itemType === 'role' ? 'Cargo' : 'Plano de Fundo', inline: true },
          { name: 'Item', value: item.name, inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: `Adicionado por ${interaction.user.username}` });

      if (itemType === 'role') {
        embed.setImage(item.icon);
      } else {
        embed.setImage(item.imageUrl);
      }

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao adicionar o item!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};