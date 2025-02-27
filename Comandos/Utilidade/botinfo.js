const Discord = require("discord.js");
const config = require('../../config.json'); // Importe o config.json

module.exports = {
  name: "botinfo", // Nome do comando
  description: "Fornece informações sobre o bot.", // Descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {


    // Coleta informações sobre o bot
    const membros = client.users.cache.size;
    const servidores = client.guilds.cache.size;
    const canais = client.channels.cache.size;
    const bot = client.user.tag;
    const avatar_bot = client.user.displayAvatarURL({ dynamic: true });
    const linguagem = "JavaScript";
    const livraria = "Discord.Js";
    const ping = client.ws.ping;

    // Tenta obter o objeto do usuário dono
    

    // Verifica se o dono foi encontrado
    if (!dono) {
      return interaction.reply({ content: "Não foi possível encontrar o dono do bot.", ephemeral: true });
    }

    // Cria o embed com as informações
    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: bot, iconURL: avatar_bot })
      .setFooter({ text: bot, iconURL: avatar_bot })
      .setTimestamp(new Date())
      .setThumbnail(avatar_bot)
      .setDescription(
        `Olá ${interaction.user}, veja minhas informações abaixo:\n\n` +
        `> 🤖 Nome: \`${bot}\`.\n` +
        `> ⚙ Membros: \`${membros}\`.\n` +
        `> ⚙ Servidores: \`${servidores}\`.\n` +
        `> ⚙ Canais: \`${canais}\`.\n` +
        `> ⚙ Ping: \`${ping}\`.\n` +
        `> 📚 Linguagem de programação: \`${linguagem}\`.\n` +
        `> 📚 Livraria: \`${livraria}\`.`
      );

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  }
};