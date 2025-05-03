const { AttachmentBuilder, MessageFlags } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

async function loadImageWithConversion(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ao baixar imagem: ${response.statusText}`);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    return await loadImage(pngBuffer);
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    throw error;
  }
}

module.exports = {
  name: 'ship',
  description: 'Cria um "casal" com porcentagem de compatibilidade entre dois usuários',
  type: 1,
  options: [
    {
      name: 'user1',
      description: 'Primeiro usuário',
      type: 6, // USER type
      required: true
    },
    {
      name: 'user2',
      description: 'Segundo usuário',
      type: 6, // USER type
      required: true
    }
  ],

  run: async (client, interaction) => {
    const timeout = setTimeout(async () => {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⌛ O processamento do ship está demorando mais que o esperado...',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }
    }, 2500);

    try {
      await interaction.deferReply().catch(error => {
        if (error.code === 10062) return;
        throw error;
      });

      const user1 = interaction.options.getUser('user1');
      const user2 = interaction.options.getUser('user2');
      
      // Gerar porcentagem aleatória com algumas variações para parecer mais "real"
      let percentage = Math.floor(Math.random() * 101);
      // Ajustar para tornar extremos mais raros
      if (percentage < 10) percentage = Math.floor(Math.random() * 20);
      if (percentage > 90) percentage = 80 + Math.floor(Math.random() * 21);
      
      const width = 1280;
      const height = 720;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const fontFamily = 'Arial';

      const applyText = (text, x, y, size = 48, isBold = false, color = '#000000') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.font = `${isBold ? 'bold ' : ''}${size}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      const applyCenteredText = (text, x, y, size = 48, isBold = false, color = '#000000') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.font = `${isBold ? 'bold ' : ''}${size}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      // Fundo degradê rosa/roxo
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(1, '#fad0c4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Adicionar corações pequenos no fundo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 20 + 10;
        drawHeart(ctx, x, y, size);
      }

    ////   Retângulo central com transparência
    //   ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //   ctx.roundRect(40, 40, width - 80, height - 80, 30);
    //   ctx.fill();

      // Carregar avatares
      try {
        const avatarSize = 200;
        const avatar1Url = user1.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar2Url = user2.displayAvatarURL({ extension: 'png', size: 512 });
        
        const [avatar1, avatar2] = await Promise.all([
          loadImageWithConversion(avatar1Url),
          loadImageWithConversion(avatar2Url)
        ]);

        // Posicionar avatares
        const avatar1X = width / 4 - avatarSize / 2;
        const avatar2X = (width / 4) * 3 - avatarSize / 2;
        const avatarY = height / 3 - avatarSize / 2;

        // Desenhar avatares com bordas
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar1, avatar1X, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar2, avatar2X, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Bordas dos avatares
        ctx.strokeStyle = '#ff6b88';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Coração entre os avatares
        const heartX = width / 2;
        const heartY = height / 3;
        const heartSize = 60;
        ctx.fillStyle = '#ff6b88';
        drawHeart(ctx, heartX, heartY, heartSize);

        // Barra de compatibilidade
        const barWidth = width - 200;
        const barHeight = 30;
        const barX = 100;
        const barY = height / 2 + 50;

        // Fundo da barra
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.roundRect(barX, barY, barWidth, barHeight, 15);
        ctx.fill();

        // Preenchimento da barra
        const fillWidth = (barWidth * percentage) / 100;
        const barGradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY + barHeight);
        barGradient.addColorStop(0, '#ff6b88');
        barGradient.addColorStop(1, '#ff8e53');
        ctx.fillStyle = barGradient;
        ctx.roundRect(barX, barY, fillWidth, barHeight, 15);
        ctx.fill();

        // Texto da porcentagem
        applyCenteredText(`${percentage}%`, width / 2, barY - 20, 48, true, '#ffffff');

        // Nomes dos usuários
        applyCenteredText(user1.username, avatar1X + avatarSize / 2, avatarY + avatarSize + 40, 32, true);
        applyCenteredText(user2.username, avatar2X + avatarSize / 2, avatarY + avatarSize + 40, 32, true);

        // Mensagem personalizada baseada na porcentagem
        let message = '';
        if (percentage < 20) message = 'Melhor manter só na amizade...';
        else if (percentage < 40) message = 'Hmm... talvez com mais tempo?';
        else if (percentage < 60) message = 'Há uma química interessante!';
        else if (percentage < 80) message = 'Um casal promissor! 💖';
        else message = 'Alma gêmea encontrada! 💞';

        applyCenteredText(message, width / 2, barY + barHeight + 50, 32, false, '#ffffff');

        // Rodapé
        applyCenteredText('Ship • ZikBot', width / 2, height - 50, 24);

      } catch (error) {
        console.error('Erro ao carregar avatares:', error);
        throw error;
      }

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'ship.png' });

      clearTimeout(timeout);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: ' ', files: [attachment] }).catch(error => {
          if (error.code !== 10062) console.error('Erro ao editar resposta:', error);
        });
      }

    } catch (error) {
      clearTimeout(timeout);
      console.error('Erro no comando ship:', error);
      const errorMessage = error.message.includes('Timeout')
        ? '⌛ O tempo para gerar o ship expirou. Tente novamente!'
        : '❌ Ocorreu um erro ao gerar o ship!';

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(console.error);
      } else {
        await interaction.editReply({ content: errorMessage }).catch(error => {
          if (error.code !== 10062) console.error('Erro ao enviar mensagem de erro:', error);
        });
      }
    }
  }
};

// Função auxiliar para desenhar coração
function drawHeart(ctx, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y);
  ctx.bezierCurveTo(x - size, y + size / 2, x, y + size, x, y + size);
  ctx.bezierCurveTo(x, y + size, x + size, y + size / 2, x + size, y);
  ctx.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}