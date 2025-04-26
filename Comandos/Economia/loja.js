const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const { Background, UserInventory } = require('../../models/ShopItems');
const User = require('../../models/User');

module.exports = {
  name: 'loja',
  description: 'Navegue pelos planos de fundo disponíveis na loja',
  type: 1,

  run: async (client, interaction) => {
    try {
      const items = await Background.find({ availableInShop: true }).sort({ price: 1 });

      if (!items.length) {
        return interaction.reply({
          content: '❌ Não há planos de fundo disponíveis na loja no momento!',
          flags: MessageFlags.Ephemeral
        });
      }

      let currentIndex = 0;

      const getItemEmbed = (index) => {
        const item = items[index];
        return new EmbedBuilder()
          .setColor('#EB459E')
          .setTitle(item.name)
          .setDescription(`**Preço:** ${item.price} estrelas`)
          .setImage(item.imageUrl)
          .setFooter({ text: `Item ${index + 1} de ${items.length} | Plano de Fundo` });
      };

      const getNavigationButtons = (index) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === 0),
          new ButtonBuilder()
            .setCustomId('buy')
            .setLabel('🛒 Comprar')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Próximo ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === items.length - 1)
        );
      };

      await interaction.reply({
        embeds: [getItemEmbed(currentIndex)],
        components: [getNavigationButtons(currentIndex)]
      });

      const message = await interaction.fetchReply();
      const collector = message.createMessageComponentCollector({ time: 5 * 60 * 1000 });

      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: '❌ Você não pode interagir com esta mensagem!',
            flags: MessageFlags.Ephemeral
          });
        }

        const item = items[currentIndex];

        switch (i.customId) {
          case 'prev':
            currentIndex = Math.max(0, currentIndex - 1);
            return i.update({
              embeds: [getItemEmbed(currentIndex)],
              components: [getNavigationButtons(currentIndex)]
            });

          case 'next':
            currentIndex = Math.min(items.length - 1, currentIndex + 1);
            return i.update({
              embeds: [getItemEmbed(currentIndex)],
              components: [getNavigationButtons(currentIndex)]
            });

          case 'buy':
            try {
              let user = await User.findOne({ userId: i.user.id }) || new User({ userId: i.user.id, stars: 0 });
              let inventory = await UserInventory.findOne({ userId: i.user.id }) || new UserInventory({ userId: i.user.id });

              const alreadyOwned = inventory.ownedBackgrounds.includes(item._id);
              if (alreadyOwned) {
                return i.reply({
                  content: '❌ Você já possui este plano de fundo!',
                  flags: MessageFlags.Ephemeral
                });
              }

              if (user.stars < item.price) {
                return i.reply({
                  content: `❌ Saldo insuficiente! Faltam ${item.price - user.stars} estrelas.`,
                  flags: MessageFlags.Ephemeral
                });
              }

              user.stars -= item.price;
              inventory.ownedBackgrounds.push(item._id);

              await Promise.all([user.save(), inventory.save()]);

              return i.reply({
                content: `✅ Você comprou **${item.name}** por ${item.price} estrelas!\nSeu novo saldo: ${user.stars} estrelas`,
                flags: MessageFlags.Ephemeral
              });

            } catch (error) {
              console.error('Erro na compra:', error);
              return i.reply({
                content: '❌ Ocorreu um erro ao processar sua compra!',
                flags: MessageFlags.Ephemeral
              });
            }
        }
      });

      collector.on('end', async () => {
        try {
          await message.edit({ components: [] });
        } catch (error) {
          if (error.code !== 10008) {
            // console.warn('Erro inesperado ao encerrar collector:', error.message);
          }
        }
      });

    } catch (error) {
      console.error('Erro no comando loja:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao carregar a loja!',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
