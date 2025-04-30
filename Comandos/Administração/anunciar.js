const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const client = require("../../index");

module.exports = {
  name: "anunciar",
  description: "[ADMIN] Anuncie algo em uma embed simples.",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "canal",
      description: "Canal onde o anúncio será enviado (opcional)",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: false,
      channel_types: [
        Discord.ChannelType.GuildText,
        Discord.ChannelType.GuildAnnouncement
      ]
    },
    {
      name: "cor",
      description: "Cor do embed (em hexadecimal, ex: #ff0000) (opcional)",
      type: Discord.ApplicationCommandOptionType.String,
      required: false
    }
  ],

  run: async (client, interaction) => {
    const canalOption = interaction.options.getChannel("canal");
    const corOption = interaction.options.getString("cor");

    const modal = new Discord.ModalBuilder()
      .setCustomId(`anunciarModal_${interaction.user.id}_${canalOption?.id || "current"}_${corOption || "default"}`)
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

    const actionRow1 = new Discord.ActionRowBuilder().addComponents(tituloInput);
    const actionRow2 = new Discord.ActionRowBuilder().addComponents(descricaoInput);

    modal.addComponents(actionRow1, actionRow2);

    await interaction.showModal(modal);
  },
};

// Função para validar cor hexadecimal
function isValidColor(color) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

// Captura a interação do modal
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("anunciarModal_")) return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    // Extrai os dados do customId
    const customIdParts = interaction.customId.split('_');
    const userId = customIdParts[1];
    const canalId = customIdParts[2] === "current" ? null : customIdParts[2];
    let cor = customIdParts[3] === "default" ? "#3498db" : customIdParts[3];

    const titulo = interaction.fields.getTextInputValue("tituloInput");
    const descricao = interaction.fields.getTextInputValue("descricaoInput");

    // Valida a cor
    let corInvalida = false;
    if (cor !== "#3498db" && !isValidColor(cor)) {
      await interaction.followUp({
        content: `⚠️ Não foi possível usar a cor "${cor}" (formato inválido). Usando cor padrão (#3498db)`,
        flags: MessageFlags.Ephemeral,
      });
      cor = "#3498db";
      corInvalida = true;
    }

    // Determina o canal - prioriza o canal selecionado na option, senão usa o canal atual
    const canal = canalId ? 
      interaction.guild.channels.cache.get(canalId) : 
      interaction.channel;

    if (!canal || (canal.type !== Discord.ChannelType.GuildText && canal.type !== Discord.ChannelType.GuildAnnouncement)) {
      return interaction.followUp({
        content: "❌ Canal inválido. Certifique-se de que é um canal de texto ou anúncio.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const descricaoFormatada = descricao
      .split("\n")
      .map((linha) => `> ${linha}`)
      .join("\n");

    const embed = new Discord.EmbedBuilder()
      .setTitle(`${titulo}`)
      .setDescription(descricaoFormatada)
      .setColor(cor)
      .setFooter({
        text: `Anúncio por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await canal.send({ embeds: [embed] });
    
    if (!corInvalida) {
      await interaction.followUp({
        content: `✅ Anúncio enviado com sucesso em ${canal}.`,
        flags: MessageFlags.Ephemeral,
      });
    }

  } catch (error) {
    console.error("Erro ao processar o anúncio:", error);
    interaction.followUp({
      content: `❌ Erro ao enviar o anúncio: ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
});