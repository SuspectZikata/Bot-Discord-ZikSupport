const Discord = require("discord.js");
const client = require("../../index"); // Importa o client corretamente

module.exports = {
  name: "dm",
  description: "Envie uma mensagem no privado de um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: "❌ Você não possui permissão para utilizar este comando!", 
        ephemeral: true 
      });
    }

    const user = interaction.options.getUser("usuário");

    // Criando o Modal (Formulário)
    const modal = new Discord.ModalBuilder()
      .setCustomId(`dmModal_${interaction.user.id}_${user.id}`)
      .setTitle("Enviar Mensagem Privada");

    // Campo para a mensagem
    const mensagemInput = new Discord.TextInputBuilder()
      .setCustomId("mensagemInput")
      .setLabel("Digite a mensagem que deseja enviar:")
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new Discord.ActionRowBuilder().addComponents(mensagemInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
};

// Captura a interação do modal de forma segura
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("dmModal_")) return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const [, senderId, userId] = interaction.customId.split("_");
    const sender = interaction.guild.members.cache.get(senderId);
    const user = interaction.guild.members.cache.get(userId);

    if (!user) {
      return interaction.followUp({
        content: "❌ O usuário selecionado não foi encontrado.",
        ephemeral: true,
      });
    }

    const mensagem = interaction.fields.getTextInputValue("mensagemInput");

    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: sender.user.username, iconURL: sender.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(mensagem);

    await user.send({ embeds: [embed] });

    const confirmEmbed = new Discord.EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ Olá ${sender.user}, a mensagem foi enviada para ${user} com sucesso!`);

    await interaction.followUp({ embeds: [confirmEmbed], ephemeral: true });

  } catch (error) {
    const errorEmbed = new Discord.EmbedBuilder()
      .setColor("Red")
      .setDescription(`❌ Olá ${interaction.user}, a mensagem **não** foi enviada para ${user}, pois o usuário está com a DM fechada!`);

    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
  }
});
