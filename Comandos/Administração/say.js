const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags, ChannelType } = require("discord.js");

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
      channel_types: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildStageVoice
      ]
    }
  ],

  run: async (client, interaction) => {
    try {
      const tipo = interaction.options.getString("tipo");
      const canalOption = interaction.options.getChannel("canal");

      const modal = new Discord.ModalBuilder()
        .setCustomId(`sayModal_${tipo}_${canalOption?.id || "current"}`)
        .setTitle("Digite sua mensagem");

      const messageInput = new Discord.TextInputBuilder()
        .setCustomId("messageInput")
        .setLabel("Conteúdo da mensagem")
        .setStyle(Discord.TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new Discord.ActionRowBuilder().addComponents(messageInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      const filter = i => i.customId.startsWith('sayModal_');
      interaction.awaitModalSubmit({ filter, time: 60000 })
        .then(async modalInteraction => {
          const messageContent = modalInteraction.fields.getTextInputValue("messageInput");
          let targetChannel = canalOption || modalInteraction.channel;

          // Ajuste especial para Stage (palco)
          if (targetChannel.type === ChannelType.GuildStageVoice) {
            const textLinked = targetChannel.guild.channels.cache.find(
              c => c.type === ChannelType.GuildText && targetChannel.id === c.parentId
            );
            if (!textLinked) {
              return modalInteraction.reply({
                content: "❌ O canal de palco não possui um canal de texto vinculado.",
                flags: MessageFlags.Ephemeral
              });
            }
            targetChannel = textLinked;
          }

          // Fórum requer criação de thread
          if (targetChannel.type === ChannelType.GuildForum) {
            const thread = await targetChannel.threads.create({
              name: `Mensagem de ${modalInteraction.user.username}`,
              message: tipo === "embed"
                ? { embeds: [new Discord.EmbedBuilder()
                    .setColor("Blue")
                    .setAuthor({
                      name: modalInteraction.user.username,
                      iconURL: modalInteraction.user.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(messageContent)
                    .setTimestamp()] }
                : { content: messageContent }
            });

            return modalInteraction.reply({
              content: `✅ Mensagem enviada com sucesso no fórum: ${thread.toString()}`,
              flags: MessageFlags.Ephemeral
            });
          }

          // Envio padrão
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

        }).catch(() => {
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
