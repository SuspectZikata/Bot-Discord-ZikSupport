const Discord = require("discord.js");

module.exports = {
  name: "serverinfo", // Nome do comando
  description: "Envia as informações do servidor atual.", // Descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const { guild } = interaction;

    // Verifica se o servidor tem um ícone
    const iconURL = guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png"; // URL de fallback

    // Formatação da data de criação
    const criacao = guild.createdAt.toLocaleDateString("pt-br");

    // Contagem de canais
    const canaisTotal = guild.channels.cache.size;
    const canaisTexto = guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size;
    const canaisVoz = guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildVoice).size;
    const canaisCategoria = guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildCategory).size;

    // Criação do embed
    const embed = new Discord.EmbedBuilder()
      .setColor(0xFF0000) // Vermelho
      .setAuthor({ name: guild.name, iconURL: iconURL })
      .setThumbnail(iconURL)
      .addFields(
        { name: "💻 Nome:", value: `\`${guild.name}\``, inline: true },
        { name: "🆔 ID:", value: `\`${guild.id}\``, inline: true },
        { name: "👥 Membros:", value: `\`${guild.memberCount}\``, inline: true },
        { name: "📅 Criação:", value: `\`${criacao}\``, inline: true },
        { name: "📤 Canais Totais:", value: `\`${canaisTotal}\``, inline: true },
        { name: "📝 Canais de Texto:", value: `\`${canaisTexto}\``, inline: false },
        { name: "🔊 Canais de Voz:", value: `\`${canaisVoz}\``, inline: false },
        { name: "📂 Categorias:", value: `\`${canaisCategoria}\``, inline: false }
      );

    // Botão com link para o ícone do servidor (só é adicionado se o servidor tiver um ícone)
    const botao = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setURL(iconURL)
        .setLabel("Ícone do servidor")
        .setStyle(Discord.ButtonStyle.Link)
    );

    // Responde com o embed e o botão
    await interaction.reply({ embeds: [embed], components: [botao] });
  }
};