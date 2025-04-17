const Discord = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Background } = require('../../models/ShopItems');

const ADMIN_ID = '406857514639163393'; // Mantenha as aspas

module.exports = {
  name: 'gerenciar-loja', // Novo nome do comando
  description: '[OWNER] Gerencia planos de fundo na loja.', // Descrição atualizada
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'acao',
      description: 'Ação a ser realizada',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Adicionar à loja', value: 'add' },
        { name: 'Remover da loja', value: 'remove' }
      ]
    },
    {
      name: 'nome',
      description: 'Nome exato do plano de fundo',
      type: Discord.ApplicationCommandOptionType.String,
      required: true
    }
  ],
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    // Verificação de admin
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({
        content: '❌ Apenas o administrador pode usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }

    const action = interaction.options.getString('acao');
    const name = interaction.options.getString('nome');

    try {
      const item = await Background.findOne({ name });

      if (!item) {
        return interaction.reply({
          content: '❌ Plano de fundo não encontrado!',
          flags: MessageFlags.Ephemeral
        });
      }

      // Atualiza disponibilidade na loja
      item.availableInShop = action === 'add';
      await item.save();

      const embed = new Discord.EmbedBuilder()
        .setColor(action === 'add' ? '#00FF00' : '#FF0000')
        .setTitle(action === 'add' ? '✅ Plano adicionado à loja' : '❌ Plano removido da loja')
        .addFields(
          { name: 'Nome', value: item.name, inline: true },
          { name: 'Preço', value: `${item.price} estrelas`, inline: true }
        )
        .setThumbnail(item.imageUrl);

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } catch (error) {
      console.error('Erro ao modificar loja:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao atualizar a loja!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};