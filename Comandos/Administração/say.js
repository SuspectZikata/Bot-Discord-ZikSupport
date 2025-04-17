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
      flags: MessageFlags.Ephemeral,
    });

    // Coletor de interações
    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ 
      filter, 
      time: 60000 
    });

    collector.on('collect', async i => {
      if (i.customId === 'normal' || i.customId === 'embed') {
        // Cria o modal
        const modal = new Discord.ModalBuilder()
          .setCustomId(`sayModal_${i.customId}`)
          .setTitle("Enviar Mensagem");

        const messageInput = new Discord.TextInputBuilder()
          .setCustomId("message")
          .setLabel("Mensagem")
          .setStyle(Discord.TextInputStyle.Paragraph)
          .setPlaceholder("Digite sua mensagem aqui")
          .setRequired(true);

        const actionRow = new Discord.ActionRowBuilder().addComponents(
          messageInput
        );

        modal.setComponents(actionRow);

        await i.showModal(modal);

        // Aguarda a resposta do modal
        try {
          const modalInteraction = await i.awaitModalSubmit({
            filter: mi => mi.customId === `sayModal_${i.customId}`,
            time: 60000
          });

          // Finaliza o collector
          collector.stop();

          const message = modalInteraction.fields.getTextInputValue("message");

          if (i.customId === 'embed') {
            const embed = new Discord.EmbedBuilder()
              .setColor("Blue")
              .setAuthor({ name: i.user.username, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(message);

            if (!modalInteraction.replied) {
              await modalInteraction.reply({ embeds: [embed] });
            }
          } else {
            if (!modalInteraction.replied) {
              await modalInteraction.reply({ content: message });
            }
          }
        } catch (error) {
          console.error('Erro ao processar modal:', error);
          if (!i.replied) {
            await i.reply({ content: 'Ocorreu um erro ao processar sua mensagem!', flags: MessageFlags.Ephemeral, });
          }
          collector.stop();
        }
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: 'Tempo esgotado!',
          components: []
        });
      }
    });
  },
};
