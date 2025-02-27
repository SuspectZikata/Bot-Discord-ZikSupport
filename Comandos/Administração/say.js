const Discord = require("discord.js");

module.exports = {
  name: "say",
  description: "Faça eu falar",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: `Você não possui permissão para utilizar este comando!`, ephemeral: true });
    }

    const modal = new Discord.ModalBuilder()
      .setCustomId("sayModal")
      .setTitle("Enviar Mensagem");

    const messageTypeInput = new Discord.TextInputBuilder()
      .setCustomId("messageType")
      .setLabel("Tipo de Mensagem")
      .setStyle(Discord.TextInputStyle.Short)
      .setPlaceholder("normal ou embed")
      .setRequired(true);

    const messageInput = new Discord.TextInputBuilder()
      .setCustomId("message")
      .setLabel("Mensagem")
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setPlaceholder("Digite sua mensagem aqui")
      .setRequired(true);

    const firstActionRow = new Discord.ActionRowBuilder().setComponents(messageTypeInput);
    const secondActionRow = new Discord.ActionRowBuilder().setComponents(messageInput);

    modal.setComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);

    const filter = (i) => i.customId === "sayModal" && i.user.id === interaction.user.id;
    interaction
      .awaitModalSubmit({ filter, time: 60000 }) // Aguarda a resposta do modal
      .then(async (interactionModal) => {
        const messageType = interactionModal.fields.getTextInputValue("messageType").toLowerCase();
        const message = interactionModal.fields.getTextInputValue("message");

        if (messageType !== "normal" && messageType !== "embed") {
          return interactionModal.reply({ content: "Tipo de mensagem inválido. Use 'normal' ou 'embed'.", ephemeral: true });
        }

        await interactionModal.deferUpdate(); // Evita que o modal fique carregando

        if (messageType === "embed") {
          const embed = new Discord.EmbedBuilder()
            .setColor("Blue")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(message);

          await interaction.channel.send({ embeds: [embed] });
        } else {
          await interaction.channel.send({ content: message });
        }
      })
      .catch(() => {
        // Caso o usuário não responda ao modal em 60s, nada acontece
      });
  },
};
