const Discord = require("discord.js");
const client = require("../../index"); // Importa o client corretamente

module.exports = {
  name: "anunciar",
  description: "Anuncie algo em uma embed usando um formulário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ Você não possui permissão para utilizar este comando!",
        ephemeral: true,
      });
    }

    const modal = new Discord.ModalBuilder()
      .setCustomId(`anunciarModal_${interaction.user.id}`)
      .setTitle("Criar Anúncio");

    const tituloInput = new Discord.TextInputBuilder()
      .setCustomId("tituloInput")
      .setLabel("Título do Anúncio")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(true);

    const descricaoInput = new Discord.TextInputBuilder()
      .setCustomId("descricaoInput")
      .setLabel("Descrição do Anúncio")
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setRequired(true);

    const corInput = new Discord.TextInputBuilder()
      .setCustomId("corInput")
      .setLabel("Cor do Embed (ex: #ff0000)")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(false);

    const canalInput = new Discord.TextInputBuilder()
      .setCustomId("canalInput")
      .setLabel("ID do Canal de Texto")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(true);

    const actionRow1 = new Discord.ActionRowBuilder().addComponents(tituloInput);
    const actionRow2 = new Discord.ActionRowBuilder().addComponents(descricaoInput);
    const actionRow3 = new Discord.ActionRowBuilder().addComponents(corInput);
    const actionRow4 = new Discord.ActionRowBuilder().addComponents(canalInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

    await interaction.showModal(modal);
  },
};

// Captura a interação do modal de forma segura
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("anunciarModal_")) return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const titulo = interaction.fields.getTextInputValue("tituloInput");
    const descricao = interaction.fields.getTextInputValue("descricaoInput");
    const cor = interaction.fields.getTextInputValue("corInput") || "#3498db";
    const canalId = interaction.fields.getTextInputValue("canalInput");

    const canal = interaction.guild.channels.cache.get(canalId);
    if (!canal || canal.type !== Discord.ChannelType.GuildText) {
      return interaction.followUp({
        content: "❌ Canal de texto inválido. Verifique o ID do canal.",
        ephemeral: true,
      });
    }

    const descricaoFormatada = descricao
      .split("\n")
      .map((linha) => `> ${linha}`)
      .join("\n");

    const embed = new Discord.EmbedBuilder()
      .setTitle(`📢 ${titulo}`)
      .setDescription(descricaoFormatada)
      .setColor(cor)
      .setFooter({
        text: `Anúncio por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await canal.send({ embeds: [embed] });
    interaction.followUp({
      content: `✅ Anúncio enviado com sucesso em ${canal}.`,
      ephemeral: true,
    });

  } catch (error) {
    console.error("Erro ao processar o anúncio:", error);
    interaction.followUp({
      content: `❌ Erro ao enviar o anúncio: ${error.message}`,
      ephemeral: true,
    });
  }
});
