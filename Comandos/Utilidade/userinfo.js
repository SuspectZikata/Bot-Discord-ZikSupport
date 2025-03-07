const Discord = require("discord.js");

module.exports = {
  name: "userinfo", // Nome do comando
  description: "Veja informações de um usuário.", // Descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("usuário");
    const { createdAt, id, tag, bot, username } = user;

    // Formatação da data de criação da conta
    const dataConta = createdAt.toLocaleString("pt-br");

    // Verifica se o usuário é um bot
    const isBot = bot ? "Sim" : "Não";

    // Criação do embed
    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTitle("Informações do Usuário:")
      .addFields(
        { name: "🎇 Tag:", value: `\`${tag}\``, inline: false },
        { name: "🆔 ID:", value: `\`${id}\``, inline: false },
        { name: "📅 Criação da conta:", value: `\`${dataConta}\``, inline: false },
        { name: "🤖 É um bot?", value: `\`${isBot}\``, inline: false }
      );

    // Botão com link para o avatar do usuário
    const botao = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setURL(user.displayAvatarURL({ dynamic: true }))
        .setEmoji("📎")
        .setStyle(Discord.ButtonStyle.Link)
        .setLabel(`Avatar de ${username}`)
    );

    // Responde com o embed e o botão
    await interaction.reply({ embeds: [embed], components: [botao] });
  },
};