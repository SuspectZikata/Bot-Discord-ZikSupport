const Discord = require("discord.js");
const { MessageFlags } = require("discord.js");
const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const config = require("../../config.json");

module.exports = {
  name: "boasvindas-config",
  description: "[ADMIN] Configure as mensagens de boas-vindas do servidor",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [],

  run: async (client, interaction) => {
    // Inicializa configurações se não existirem
    if (!config.boasVindas) {
      config.boasVindas = {
        canalId: "",
        imagemFundo: "https://raw.githubusercontent.com/SuspectZikata/Imagens-ZikBot/refs/heads/main/ZikGuild/BoasVindasGuild.png",
        mensagem: "Bem-vindo(a) ao servidor, {usuario}!"
      };
      saveConfig();
    }

    // Cria os botões de configuração
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('config_canal')
          .setLabel('Configurar Canal')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('config_imagem')
          .setLabel('Configurar Imagem')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_mensagem')
          .setLabel('Configurar Mensagem')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('visualizar_boasvindas')
          .setLabel('Visualizar')
          .setStyle(ButtonStyle.Danger)
      );

    // Envia a mensagem inicial
    await interaction.reply({
      content: `**Configurações Atuais:**\n\n` +
               `📌 Canal: ${config.boasVindas.canalId ? `<#${config.boasVindas.canalId}>` : "Não configurado"}\n` +
               `🖼️ Imagem: [Clique para ver](${config.boasVindas.imagemFundo})\n` +
               `📝 Mensagem: \`${config.boasVindas.mensagem}\``,
      components: [row],
      flags: MessageFlags.Ephemeral
    });

    // Cria um coletor para os botões
    const buttonCollector = interaction.channel.createMessageComponentCollector({ 
      filter: i => i.user.id === interaction.user.id, 
      time: 60000 
    });

    // Cria um coletor para os modais (vinculado ao mesmo tempo do buttonCollector)
    const modalCollector = interaction.channel.createModalSubmitCollector({
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('config'),
      time: 60000
    });

    // Manipulador de eventos para botões
    buttonCollector.on('collect', async i => {
      try {
        if (i.customId === 'config_canal') {
          const modal = new ModalBuilder()
            .setCustomId('configCanalModal')
            .setTitle('Configurar Canal de Boas-Vindas');

          const canalInput = new TextInputBuilder()
            .setCustomId('canalInput')
            .setLabel("ID do Canal de Boas-Vindas")
            .setStyle(TextInputStyle.Short)
            .setValue(config.boasVindas.canalId || "");

          modal.addComponents(new ActionRowBuilder().addComponents(canalInput));
          await i.showModal(modal);

        } else if (i.customId === 'config_imagem') {
          const modal = new ModalBuilder()
            .setCustomId('configImagemModal')
            .setTitle('Configurar Imagem de Fundo');

          const imagemInput = new TextInputBuilder()
            .setCustomId('imagemInput')
            .setLabel("URL da Imagem")
            .setStyle(TextInputStyle.Short)
            .setValue(config.boasVindas.imagemFundo || "");

          modal.addComponents(new ActionRowBuilder().addComponents(imagemInput));
          await i.showModal(modal);

        } else if (i.customId === 'config_mensagem') {
          const modal = new ModalBuilder()
            .setCustomId('configMensagemModal')
            .setTitle('Configurar Mensagem de Boas-Vindas');

          const mensagemInput = new TextInputBuilder()
            .setCustomId('mensagemInput')
            .setLabel("Use {usuario} para mencionar o usuário")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(config.boasVindas.mensagem || "");

          modal.addComponents(new ActionRowBuilder().addComponents(mensagemInput));
          await i.showModal(modal);

        } else if (i.customId === 'visualizar_boasvindas') {
          await i.deferReply({ flags: MessageFlags.Ephemeral });
          
          try {
            const preview = await generateWelcomeImage(interaction.user);
            await i.editReply({
              content: '**Pré-visualização da mensagem de boas-vindas:**',
              files: [preview.attachment],
              flags: MessageFlags.Ephemeral
            });
          } catch (error) {
            console.error('Erro ao gerar pré-visualização:', error);
            await i.editReply({
              content: '❌ Ocorreu um erro ao gerar a pré-visualização. Verifique a URL da imagem.',
              flags: MessageFlags.Ephemeral
            });
          }
        }
      } catch (error) {
        console.error('Erro no coletor de interações:', error);
      }
    });

    // Manipulador de eventos para modais
    modalCollector.on('collect', async modalInteraction => {
      try {
        await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });

        if (modalInteraction.customId === 'configCanalModal') {
          config.boasVindas.canalId = modalInteraction.fields.getTextInputValue('canalInput');
          saveConfig();
          await modalInteraction.editReply({ content: '✅ Canal de boas-vindas configurado com sucesso!', flags: MessageFlags.Ephemeral });

        } else if (modalInteraction.customId === 'configImagemModal') {
          config.boasVindas.imagemFundo = modalInteraction.fields.getTextInputValue('imagemInput');
          saveConfig();
          await modalInteraction.editReply({ content: '✅ Imagem de fundo configurada com sucesso!', flags: MessageFlags.Ephemeral });

        } else if (modalInteraction.customId === 'configMensagemModal') {
          config.boasVindas.mensagem = modalInteraction.fields.getTextInputValue('mensagemInput');
          saveConfig();
          await modalInteraction.editReply({ content: '✅ Mensagem de boas-vindas configurada com sucesso!', flags: MessageFlags.Ephemeral });
        }

        // Atualiza a mensagem original
        await interaction.editReply({
          content: `**Configurações Atuais:**\n\n` +
                   `📌 Canal: ${config.boasVindas.canalId ? `<#${config.boasVindas.canalId}>` : "Não configurado"}\n` +
                   `🖼️ Imagem: [Clique para ver](${config.boasVindas.imagemFundo})\n` +
                   `📝 Mensagem: \`${config.boasVindas.mensagem}\``,
          components: [row]
        });

      } catch (error) {
        console.error('Erro ao processar modal:', error);
        await modalInteraction.editReply({ content: '❌ Ocorreu um erro ao salvar as configurações.', flags: MessageFlags.Ephemeral });
      }
    });

    // Manipulador de eventos para quando o coletor terminar
    buttonCollector.on('end', () => {
      modalCollector.stop();
    });

    // Função para gerar a imagem de boas-vindas
    async function generateWelcomeImage(user) {
      // Carrega a imagem de fundo para obter suas dimensões
      const backgroundImg = await loadImage(config.boasVindas.imagemFundo);
      const bgWidth = backgroundImg.width;
      const bgHeight = backgroundImg.height;

      // Cria canvas com o tamanho da imagem de fundo
      const canvas = createCanvas(bgWidth, bgHeight);
      const ctx = canvas.getContext('2d');

      // Desenha a imagem de fundo
      ctx.drawImage(backgroundImg, 0, 0, bgWidth, bgHeight);

      // Adiciona camada escura para melhor contraste
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, bgWidth, bgHeight);

      // Carrega o avatar em alta resolução
      const avatarImg = await loadImage(user.displayAvatarURL({ 
        format: 'png', 
        size: 512,
        forceStatic: true 
      }));

      // Calcula o tamanho do avatar (25% da menor dimensão da imagem)
      const avatarSize = Math.min(bgWidth, bgHeight) * 0.40;

      // Centralização perfeita
      const centerX = bgWidth / 2;
      const centerY = bgHeight / 2;

      // Desenha o avatar como círculo perfeitamente centralizado
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY - avatarSize * 0.1, // Ajuste fino de posicionamento vertical
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(
        avatarImg,
        centerX - avatarSize / 2,
        centerY - avatarSize / 2 - avatarSize * 0.1, // Ajuste fino
        avatarSize,
        avatarSize
      );
      ctx.restore();

      // Borda branca com tamanho proporcional
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = avatarSize * 0.01; // 3% do tamanho do avatar
      ctx.stroke();

      // Configura o texto do nome de usuário
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Tamanho da fonte proporcional (18% do tamanho do avatar)
      const fontSize = avatarSize * 0.18;
      ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;

      // Desenha apenas o nome de usuário centralizado abaixo do avatar
      ctx.fillText(
        user.username,
        centerX,
        centerY + avatarSize / 2 + fontSize * 1.2 // Espaçamento proporcional
      );

      const buffer = canvas.toBuffer('image/png');
      const attachment = new Discord.AttachmentBuilder(buffer, { name: 'preview_boasvindas.png' });

      return { attachment };
    }

    // Função para salvar configurações
    function saveConfig() {
      fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2));
    }
  }
};