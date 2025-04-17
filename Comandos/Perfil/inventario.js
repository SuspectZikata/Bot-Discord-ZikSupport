const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { Background, UserInventory } = require('../../models/ShopItems');

module.exports = {
  name: 'inventario',
  description: 'Veja seus planos de fundo adquiridos',
  type: 1,

  run: async (client, interaction) => {
    try {
      // Busca o inventário do usuário
      let userInventory = await UserInventory.findOne({ userId: interaction.user.id });

      if (!userInventory) {
        return interaction.reply({
          content: '❌ Você não possui itens no inventário ainda!',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }

      // Busca os planos de fundo
      const itemIds = userInventory.ownedBackgrounds;
      const allItems = await Background.find({ _id: { $in: itemIds } });

      if (allItems.length === 0) {
        return interaction.reply({
          content: '❌ Você não possui planos de fundo no inventário!',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }

      let currentIndex = 0;

      const createItemEmbed = (index) => {
        const item = allItems[index];
        const isEquipped = userInventory.equippedBackground?.equals(item._id);

        const embed = new EmbedBuilder()
          .setColor('#EB459E')
          .setTitle(item.name)
          .setDescription(`**Preço:** ${item.price} estrelas`)
          .setImage(item.imageUrl)
          .setFooter({ 
            text: `Item ${index + 1} de ${allItems.length} | Plano de Fundo` 
          });

        if (isEquipped) {
          embed.addFields({ name: 'Status', value: '✅ Equipado' });
        }

        return embed;
      };

      const createButtons = (index) => {
        const row = new ActionRowBuilder();
        const item = allItems[index];
        const isEquipped = userInventory.equippedBackground?.equals(item._id);

        // Botão Anterior
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === 0)
        );
        
        // Botão Equipar/Desequipar
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('equip')
            .setLabel(isEquipped ? '❌ Desequipar' : '✅ Equipar')
            .setStyle(isEquipped ? ButtonStyle.Danger : ButtonStyle.Success)
        );
        
        // Botão Próximo
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Próximo ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === allItems.length - 1)
        );
        
        return row;
      };

      // Envia a mensagem inicial
      const replyOptions = {
        embeds: [createItemEmbed(currentIndex)],
        components: [createButtons(currentIndex)]
      };

      // Tenta responder à interação
      let message;
      try {
        if (interaction.replied || interaction.deferred) {
          message = await interaction.editReply(replyOptions);
        } else {
          message = await interaction.reply({
            ...replyOptions
          });
        }
          message = await interaction.fetchReply();
      } catch (error) {
        console.error('Erro ao responder à interação:', error);
        return;
      }

      // Cria o coletor com tempo reduzido (3 minutos)
      const collector = message.createMessageComponentCollector({ 
        time: 180000,
        idle: 30000
      });

      collector.on('collect', async (i) => {
        try {
          if (i.user.id !== interaction.user.id) {
            return i.reply({
              content: '❌ Você não pode interagir com esta mensagem!',
              flags: MessageFlags.Ephemeral
            }).catch(console.error);
          }

          let feedback = null;
          let needsUpdate = true;

          switch (i.customId) {
            case 'prev':
              currentIndex--;
              break;
              
            case 'next':
              currentIndex++;
              break;
              
            case 'equip':
              try {
                const item = allItems[currentIndex];
                const isEquipped = userInventory.equippedBackground?.equals(item._id);

                userInventory = await UserInventory.findOneAndUpdate(
                  { userId: interaction.user.id },
                  { equippedBackground: isEquipped ? null : item._id },
                  { new: true }
                );

                feedback = `✅ ${item.name} ${isEquipped ? 'desequipado' : 'equipado'} com sucesso!`;
              } catch (error) {
                console.error('Erro ao equipar item:', error);
                feedback = '❌ Ocorreu um erro ao equipar o item!';
                needsUpdate = false;
              }
              break;
          }

          if (needsUpdate) {
            await i.update({
              content: feedback,
              embeds: [createItemEmbed(currentIndex)],
              components: [createButtons(currentIndex)]
            }).catch(error => {
              if (error.code !== 10062) { // Ignora Unknown Interaction
                console.error('Erro ao atualizar interação:', error);
              }
            });
          } else {
            await i.reply({
              content: feedback,
              flags: MessageFlags.Ephemeral
            }).catch(console.error);
          }

        } catch (error) {
          console.error('Erro no coletor:', error);
          if (!i.replied && !i.deferred) {
            await i.reply({
              content: '❌ Ocorreu um erro ao processar sua ação!',
              flags: MessageFlags.Ephemeral
            }).catch(console.error);
          }
        }
      });

      collector.on('end', (collected, reason) => {
        if (!message.editable) return;
        
        message.edit({
          components: []
        }).catch(error => {
          if (error.code !== 10008) { // Ignora Unknown Message
            console.error('Erro ao desativar botões:', error);
          }
        });
      });

    } catch (error) {
      console.error('Erro no comando inventário:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao carregar o inventário!',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      } else {
        await interaction.editReply({
          content: '❌ Ocorreu um erro ao carregar o inventário!'
        }).catch(console.error);
      }
    }
  }
};