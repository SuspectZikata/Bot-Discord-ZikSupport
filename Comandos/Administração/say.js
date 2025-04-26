const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "say",
  description: "[ADMIN] Faça eu falar",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    // Criação dos botões de seleção
    const buttons = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('normal')
        .setLabel('Mensagem Normal')
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji('📄'),
      new Discord.ButtonBuilder()
        .setCustomId('embed')
        .setLabel('Mensagem Embed')
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji('🖼️')
    );

    await interaction.reply({
      content: 'Selecione o tipo de mensagem:',
      components: [buttons],
      flags: MessageFlags.Ephemeral
    });

    const reply = await interaction.fetchReply();

    // Coletor de interações na mensagem de resposta
    const filter = i => i.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector({ 
      filter, 
      time: 60000,
      max: 1 // Aceita apenas uma interação
    });

    collector.on('collect', async i => {
      if (i.customId === 'normal' || i.customId === 'embed') {
        // Cria o modal
        const modal = new Discord.ModalBuilder()
          .setCustomId(`sayModal_${i.customId}_${i.id}`) // ID único
          .setTitle("Enviar Mensagem");

        // Mensagem input
        const messageInput = new Discord.TextInputBuilder()
          .setCustomId("message")
          .setLabel("Mensagem")
          .setStyle(Discord.TextInputStyle.Paragraph)
          .setPlaceholder("Digite sua mensagem aqui")
          .setRequired(true);

        // Canal input
        const channelInput = new Discord.TextInputBuilder()
          .setCustomId("channel")
          .setLabel("Canal (opcional)")
          .setStyle(Discord.TextInputStyle.Short)
          .setPlaceholder("ID do canal ou mencione o canal")
          .setRequired(false);

        // Criar ActionRows separados
        const firstActionRow = new Discord.ActionRowBuilder().addComponents(messageInput);
        const secondActionRow = new Discord.ActionRowBuilder().addComponents(channelInput);

        modal.addComponents(firstActionRow, secondActionRow);

        try {
          await i.showModal(modal);
          
          // Aguarda a resposta do modal
          const modalFilter = mi => mi.customId === `sayModal_${i.customId}_${i.id}`;
          const modalInteraction = await i.awaitModalSubmit({
            filter: modalFilter,
            time: 60000
          }).catch(() => null);

          if (!modalInteraction) {
            return i.followUp({
              content: 'Tempo esgotado para enviar a mensagem!',
              flags: MessageFlags.Ephemeral
            }).catch(() => {});
          }

          const message = modalInteraction.fields.getTextInputValue("message");
          const channelInputValue = modalInteraction.fields.getTextInputValue("channel");

          let targetChannel = interaction.channel;

          if (channelInputValue) {
            try {
              // Extrai ID do canal se for uma menção
              const channelId = channelInputValue.replace(/[<#>]/g, '');
              const channel = await client.channels.fetch(channelId);
              if (channel) targetChannel = channel;
            } catch (error) {
              console.error("Erro ao buscar canal:", error);
              return modalInteraction.reply({ 
                content: 'Canal inválido! Mensagem será enviada no canal atual.', 
                flags: MessageFlags.Ephemeral
              }).catch(() => {});
            }
          }

          if (i.customId === 'embed') {
            const embed = new Discord.EmbedBuilder()
              .setColor("Blue")
              .setAuthor({ 
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
              })
              .setDescription(message);

            await targetChannel.send({ embeds: [embed] });
          } else {
            await targetChannel.send({ content: message });
          }

          // Verifica se já foi respondido
          if (!modalInteraction.replied) {
            await modalInteraction.reply({ 
              content: 'Mensagem enviada com sucesso!', 
              flags: MessageFlags.Ephemeral
            }).catch(() => {});
          }
          
        } catch (error) {
          console.error('Erro no modal:', error);
          if (!i.replied && !i.deferred) {
            await i.followUp({ 
              content: 'Ocorreu um erro ao processar sua mensagem!', 
              flags: MessageFlags.Ephemeral
            }).catch(() => {});
          }
        }
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({
          content: 'Tempo esgotado!',
          components: []
        }).catch(() => {});
      }
    });
  },
};