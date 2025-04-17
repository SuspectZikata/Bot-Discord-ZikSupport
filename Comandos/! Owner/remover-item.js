const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background, UserInventory } = require('../../models/ShopItems');

module.exports = {
  name: 'remover-item',
  description: '[OWNER] Remove um item do inventário de um usuário.',
  type: 1,
  options: [
    {
      name: 'usuario',
      description: 'Usuário que terá o item removido',
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

      // Busca o inventário do usuário
      const inventory = await UserInventory.findOne({ userId: targetUser.id });

      if (!inventory) {
        return interaction.reply({
          content: '❌ O usuário não possui um inventário!',
          flags: MessageFlags.Ephemeral
        });
      }

      // Verifica se o usuário possui o item
      const itemField = itemType === 'role' ? 'ownedRoles' : 'ownedBackgrounds';
      const hasItem = inventory[itemField].some(id => id.equals(item._id));

      if (!hasItem) {
        return interaction.reply({
          content: `❌ O usuário não possui este ${itemType === 'role' ? 'cargo' : 'plano de fundo'}!`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Remove o item e desequipa se estiver equipado
      const updateQuery = {
        $pull: { [itemField]: item._id }
      };

      // Verifica se o item está equipado
      const equippedField = itemType === 'role' ? 'equippedRole' : 'equippedBackground';
      if (inventory[equippedField]?.equals(item._id)) {
        updateQuery.$unset = { [equippedField]: "" };
      }

      await UserInventory.updateOne(
        { userId: targetUser.id },
        updateQuery
      );

      // Embed de confirmação
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('✅ Item removido com sucesso!')
        .addFields(
          { name: 'Usuário', value: targetUser.tag, inline: true },
          { name: 'Tipo', value: itemType === 'role' ? 'Cargo' : 'Plano de Fundo', inline: true },
          { name: 'Item', value: item.name, inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: `Removido por ${interaction.user.username}` });

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
      console.error('Erro ao remover item:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao remover o item!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};