const Discord = require("discord.js");

module.exports = {
  name: "botinfo", // Nome do comando
  description: "Fornece informações sobre o bot.", // Descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    // Coleta informações sobre o bot
    const { user, ws } = client;
    const membros = client.users.cache.size;
    const servidores = client.guilds.cache.size;
    const canais = client.channels.cache.size;
    const botTag = user.tag;
    const avatarBot = user.displayAvatarURL({ dynamic: true });
    const linguagem = "JavaScript";
    const livraria = "Discord.Js";
    const ping = ws.ping;

    // Cria o embed com as informações
    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: botTag, iconURL: avatarBot })
      .setFooter({ text: botTag, iconURL: avatarBot })
      .setTimestamp()
      .setThumbnail(avatarBot)
      .setDescription(
        `Olá ${interaction.user}, veja minhas informações abaixo:\n\n` +
        `> 🤖 **Nome:** \`${botTag}\`\n` +
        `> ⚙ **Membros:** \`${membros}\`\n` +
        `> � **Servidores:** \`${servidores}\`\n` +
        `> ⚙ **Canais:** \`${canais}\`\n` +
        `> ⚙ **Ping:** \`${ping}ms\`\n` +
        `> 📚 **Linguagem de programação:** \`${linguagem}\`\n` +
        `> 📚 **Livraria:** \`${livraria}\``
      );

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  }
};