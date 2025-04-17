const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    MessageFlags,
  } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  
  module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
      // Botões
      if (interaction.isButton()) {
        if (interaction.customId === 'sugerir_botao' || interaction.customId === 'sugerir_anonimo_botao') {
          // Lê o config atualizado no momento da interação
          const configPath = path.resolve(__dirname, "../config.json");
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  
          // Verifica se há canal configurado
          const canalSugestao = await client.channels.fetch(config.canalSugestao).catch(() => null);
          if (!canalSugestao) {
            return interaction.reply({
              content: "❌ Nenhum canal de sugestões está configurado no momento!",
              flags: MessageFlags.Ephemeral,
            });
          }
  
          const modal = new ModalBuilder()
            .setCustomId(
              interaction.customId === 'sugerir_botao' ? 'sugerir_modal' : 'sugerir_modal_anonimo'
            )
            .setTitle('Nova Sugestão');
  
          const input = new TextInputBuilder()
            .setCustomId('sugestao_input')
            .setLabel('Digite sua sugestão')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
  
          const actionRow = new ActionRowBuilder().addComponents(input);
          modal.addComponents(actionRow);
  
          return await interaction.showModal(modal);
        }
      }
  
      // Modal Submit
      if (interaction.isModalSubmit()) {
        if (
          interaction.customId === 'sugerir_modal' ||
          interaction.customId === 'sugerir_modal_anonimo'
        ) {
          const sugestao = interaction.fields.getTextInputValue('sugestao_input');
  
          // Lê o config atualizado no momento do envio
          const configPath = path.resolve(__dirname, "../config.json");
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  
          const canalSugestao = await client.channels.fetch(config.canalSugestao).catch(() => null);
  
          if (!canalSugestao) {
            return interaction.reply({
              content: "❌ Canal de sugestões não encontrado!",
              flags: MessageFlags.Ephemeral,
            });
          }
  
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Nova Sugestão!')
            .setDescription(`**Sugestão:**\n${sugestao}`)
            .setTimestamp();
  
          if (interaction.customId === 'sugerir_modal') {
            embed.setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL(),
            });
          } else {
            embed.setFooter({ text: "Sugestão anônima" });
          }
  
          await canalSugestao.send({ embeds: [embed] }).then(async (msg) => {
            await msg.react('👍');
            await msg.react('👎');
          });
  
          return interaction.reply({
            content: "✅ Sua sugestão foi enviada com sucesso!",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    });
  };
  