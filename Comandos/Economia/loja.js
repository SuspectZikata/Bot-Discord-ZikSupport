const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const { Background, UserInventory } = require('../../models/ShopItems');
const User = require('../../models/User');
const DailyShop = require('../../models/DailyShop');

module.exports = {
  name: 'loja',
  description: 'Navegue pelos planos de fundo em destaque hoje (rotatividade diária)',
  type: 1,

  run: async (client, interaction) => {
    try {
      // Obter a data atual no horário de Brasília
      const brasiliaDate = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
      const today = new Date(brasiliaDate).toLocaleDateString('pt-BR');
      
      // Buscar os itens do dia atual
      const dailyShop = await DailyShop.findOne({ date: today })
        .populate('items')
        .exec();

      if (!dailyShop || !dailyShop.items || dailyShop.items.length === 0) {
        return interaction.reply({
          content: '🔄 A loja diária está sendo atualizada. Por favor, tente novamente em alguns segundos!',
          flags: MessageFlags.Ephemeral
        });
      }

      const items = dailyShop.items;
      let currentIndex = 0;

      // Função para gerar o embed do item atual
      const getItemEmbed = (index) => {
        const item = items[index];
        return new EmbedBuilder()
          .setColor('#FF69B4')
          .setTitle(`🏪 Loja Diária - ${today}`)
          .setDescription(`**${item.name}**\n\n💵 Preço: ${item.price} estrelas`)
          .setImage(item.imageUrl)
          .setFooter({ 
            text: `Item ${index + 1} de ${items.length} | Itens mudam à meia-noite (BR)` 
          });
      };

      // Função para gerar os botões de navegação
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

      // Enviar a mensagem inicial
      await interaction.reply({
        embeds: [getItemEmbed(currentIndex)],
        components: [getNavigationButtons(currentIndex)]
      });

      const message = await interaction.fetchReply();
      const collector = message.createMessageComponentCollector({ 
        time: 15 * 60 * 1000 // 15 minutos de tempo de interação
      });

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
            await i.update({
              embeds: [getItemEmbed(currentIndex)],
              components: [getNavigationButtons(currentIndex)]
            });
            break;

          case 'next':
            currentIndex = Math.min(items.length - 1, currentIndex + 1);
            await i.update({
              embeds: [getItemEmbed(currentIndex)],
              components: [getNavigationButtons(currentIndex)]
            });
            break;

          case 'buy':
            try {
              // Verificar saldo e ownership
              let user = await User.findOne({ userId: i.user.id }) || new User({ userId: i.user.id });
              let inventory = await UserInventory.findOne({ userId: i.user.id }) || new UserInventory({ userId: i.user.id });

              // Verificar se já possui o item
              const alreadyOwned = inventory.ownedBackgrounds.some(bg => bg.equals(item._id));
              if (alreadyOwned) {
                return i.reply({
                  content: '❌ Você já possui este plano de fundo!',
                  flags: MessageFlags.Ephemeral
                });
              }

              // Verificar saldo
              if (user.stars < item.price) {
                return i.reply({
                  content: `❌ Saldo insuficiente! Você precisa de mais ${item.price - user.stars} estrelas.`,
                  flags: MessageFlags.Ephemeral
                });
              }

              // Efetuar a compra
              user.stars -= item.price;
              inventory.ownedBackgrounds.push(item._id);

              await Promise.all([user.save(), inventory.save()]);

              // Resposta com confirmação
              const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Compra realizada!')
                .setDescription(`Você adquiriu **${item.name}** por ${item.price} estrelas.`)
                .addFields(
                  { name: 'Seu saldo atual', value: `${user.stars} estrelas`, inline: true },
                  { name: 'Itens adquiridos', value: `${inventory.ownedBackgrounds.length} no total`, inline: true }
                )
                .setThumbnail(item.imageUrl);

              await i.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral 
              });

              // Atualiza a mensagem original
              await i.editReply({
                embeds: [getItemEmbed(currentIndex)],
                components: [getNavigationButtons(currentIndex)]
              });

            } catch (error) {
              console.error('Erro na compra:', error);
              await i.reply({
                content: '❌ Ocorreu um erro ao processar sua compra!',
                flags: MessageFlags.Ephemeral
              });
            }
            break;
        }
      });

      collector.on('end', async () => {
        try {
          await message.edit({ components: [] });
        } catch (error) {
          if (error.code !== 10008) { // Ignora erro "Mensagem não encontrada"
            console.error('Erro ao desativar botões:', error);
          }
        }
      });

    } catch (error) {
      console.error('Erro no comando /loja:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao carregar a loja diária!',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};