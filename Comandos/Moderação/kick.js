const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const client = require("../../index"); // Importa o client corretamente

module.exports = {
  name: "kick",
  description: "[MOD] Expulse um membro do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.KickMembers,
  options: [
    {
      name: "membro",
      description: "Mencione um membro.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    }
  ],

  run: async (client, interaction) => {

    const user = interaction.options.getUser("membro");
    const membro = interaction.guild.members.cache.get(user.id);

    if (!membro) {
      return interaction.reply({ 
        content: "❌ O membro não foi encontrado no servidor.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    if (!membro.kickable) {
      return interaction.reply({
        content: "❌ Eu não tenho permissão para expulsar este membro.",
        flags: MessageFlags.Ephemeral
      });
    }

    // Criando o Modal (Formulário)
    const modal = new Discord.ModalBuilder()
      .setCustomId(`kickModal_${interaction.user.id}_${membro.id}`)
      .setTitle("Motivo da Expulsão");

    // Campo para o motivo
    const motivoInput = new Discord.TextInputBuilder()
      .setCustomId("motivoInput")
      .setLabel("Digite o motivo da expulsão:")
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new Discord.ActionRowBuilder().addComponents(motivoInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
};

// Captura a interação do modal de forma segura
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("kickModal_")) return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [, senderId, memberId] = interaction.customId.split("_");
    const sender = interaction.guild.members.cache.get(senderId);
    const membro = interaction.guild.members.cache.get(memberId);

    if (!membro) {
      return interaction.followUp({
        content: "❌ O membro não foi encontrado no servidor.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!membro.kickable) {
      return interaction.followUp({
        content: "❌ Eu não tenho permissão para expulsar este membro.",
        flags: MessageFlags.Ephemeral
      });
    }

    const motivo = interaction.fields.getTextInputValue("motivoInput") || "Não informado";

    // Enviar DM antes de expulsar
    const dmEmbed = new Discord.EmbedBuilder()
      .setColor("Red")
      .setTitle("🚫 Você foi expulso do servidor!")
      .setDescription(`Você foi expulso de **${interaction.guild.name}** pelo administrador **${sender.user.tag}**.\n\n📌 **Motivo:** ${motivo}`)
      .setFooter({ text: "Se achar que foi um erro, entre em contato com a equipe do servidor." });

    try {
      await membro.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.log(`Não foi possível enviar DM para ${membro.user.tag}.`);
    }

    await membro.kick(motivo);

    const embed = new Discord.EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ O usuário ${membro.user.tag} foi expulso com sucesso!\n\n> Motivo: \`${motivo}\`.`);

    await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });

  } catch (error) {
    console.error("Erro ao expulsar membro:", error);

    const embedErro = new Discord.EmbedBuilder()
      .setColor("Red")
      .setDescription(`❌ O usuário não pôde ser expulso do servidor! Houve um erro ao executar este comando.`);

    await interaction.followUp({ embeds: [embedErro], flags: MessageFlags.Ephemeral });
  }
});
