const Discord = require("discord.js")

module.exports = {
  name: "ping",
  description: "Mostra o ping do bot.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const sent = await interaction.reply({ 
      content: "📡 Calculando ping...", 
      flags: MessageFlags.Ephemeral,
      fetchReply: true 
    });

    const pingEmbed = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ 
        name: "Informações de Latência", 
        iconURL: client.user.displayAvatarURL({ dynamic: true }) 
      })
      .addFields([
        { 
          name: "📶 Latência do WebSocket", 
          value: `\`${client.ws.ping}ms\``,
          inline: true 
        },
        { 
          name: "🌐 Latência da API", 
          value: `\`${sent.createdTimestamp - interaction.createdTimestamp}ms\``,
          inline: true 
        }
      ])
      .setFooter({ 
        text: `Requisitado por ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
      })
      .setTimestamp();

    await interaction.editReply({ 
      content: null,
      embeds: [pingEmbed]
    });
  }
}