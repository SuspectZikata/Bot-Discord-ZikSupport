const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "say",
  description: "[ADMIN] Faça eu falar",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "tipo",
      description: "Tipo de mensagem",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Mensagem Normal", value: "normal" },
        { name: "Mensagem Embed", value: "embed" }
      ]
    },
    {
      name: "canal",
      description: "Canal para enviar (opcional)",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: false,
      channel_types: [Discord.ChannelType.GuildText]
    }
  ],

  run: async (client, interaction) => {
    try {
      const tipo = interaction.options.getString("tipo");
      const canalOption = interaction.options.getChannel("canal");

      // Cria o modal para a mensagem
      const modal = new Discord.ModalBuilder()
        .setCustomId(`sayModal_${tipo}_${canalOption?.id || "current"}`)
        .setTitle("Digite sua mensagem");

      // Campo de mensagem
      const messageInput = new Discord.TextInputBuilder()
        .setCustomId("messageInput")
        .setLabel("Conteúdo da mensagem")
        .setStyle(Discord.TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new Discord.ActionRowBuilder().addComponents(messageInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      // Captura a submissão do modal
      const filter = (interaction) => interaction.customId.startsWith('sayModal_');
      interaction.awaitModalSubmit({ filter, time: 60000 })
        .then(async modalInteraction => {
          const messageContent = modalInteraction.fields.getTextInputValue("messageInput");
          const targetChannel = canalOption || modalInteraction.channel;

          // Verifica se o canal é válido
          if (!targetChannel || targetChannel.type !== Discord.ChannelType.GuildText) {
            return modalInteraction.reply({
              content: "❌ Canal inválido!",
              flags: MessageFlags.Ephemeral
            });
          }

          // Envia a mensagem conforme o tipo
          if (tipo === "embed") {
            const embed = new Discord.EmbedBuilder()
              .setColor("Blue")
              .setAuthor({
                name: modalInteraction.user.username,
                iconURL: modalInteraction.user.displayAvatarURL({ dynamic: true })
              })
              .setDescription(messageContent)
              .setTimestamp();

            await targetChannel.send({ embeds: [embed] });
          } else {
            await targetChannel.send({ content: messageContent });
          }

          await modalInteraction.reply({
            content: `✅ Mensagem enviada com sucesso em ${targetChannel}!`,
            flags: MessageFlags.Ephemeral
          });
        })
        .catch(() => {
          // Tempo esgotado ou erro
          interaction.followUp({
            content: "❌ Tempo esgotado para enviar a mensagem!",
            flags: MessageFlags.Ephemeral
          });
        });

    } catch (error) {
      console.error("Erro no comando say:", error);
      await interaction.reply({
        content: "❌ Ocorreu um erro ao processar o comando!",
        flags: MessageFlags.Ephemeral
      });
    }
  }
};