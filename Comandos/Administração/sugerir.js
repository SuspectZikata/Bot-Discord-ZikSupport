const { 
    PermissionFlagsBits, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    EmbedBuilder 
  } = require('discord.js');
  const path = require('path');
  const fs = require('fs');
  
  const configPath = path.resolve(__dirname, "../../config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  
  module.exports = {
    name: "sugerir",
    description: "[ADMIN] Mensagem de sugestão.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [],
    type: 1,
  
    run: async (client, interaction) => {
      const botaoPublico = new ButtonBuilder()
        .setCustomId('sugerir_botao')
        .setLabel('Fazer uma sugestão')
        .setStyle(ButtonStyle.Primary);
  
      const botaoAnonimo = new ButtonBuilder()
        .setCustomId('sugerir_anonimo_botao')
        .setLabel('Fazer uma sugestão anônima')
        .setStyle(ButtonStyle.Secondary);
  
      const row = new ActionRowBuilder().addComponents(botaoPublico, botaoAnonimo);
  
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('💡 Sugestões Abertas!')
        .setDescription('Tem uma ideia incrível? Quer compartilhar algo que pode melhorar nosso servidor? 🔥\n\nClique em um dos botões abaixo e faça a sua sugestão agora! 🚀');
  
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  };
  