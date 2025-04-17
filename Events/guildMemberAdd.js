const Discord = require("discord.js");
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const config = require("../config.json");

module.exports = async (client) => {
  client.on("guildMemberAdd", async (member) => {
    if (!config.boasVindas?.canalId) return;

    try {
      const canal = member.guild.channels.cache.get(config.boasVindas.canalId);
      if (!canal) return;

      const canvasWidth = 1280;
      const canvasHeight = 720;

      if (config.boasVindas.imagemFundo) {
        try {
          const background = await loadImage(config.boasVindas.imagemFundo);

          // Cria canvas com tamanho fixo 1280x720
          const canvas = createCanvas(canvasWidth, canvasHeight);
          const ctx = canvas.getContext('2d');

          // Desenha imagem de fundo redimensionada para caber no canvas
          ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

          // Adiciona overlay escuro para melhor contraste
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Carrega o avatar
          const avatar = await loadImage(member.user.displayAvatarURL({
            extension: 'png',
            size: 512,
            forceStatic: true
          }));

          const avatarSize = Math.min(canvasWidth, canvasHeight) * 0.35;
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2 - 40;

          // Desenha avatar circular no centro
          ctx.beginPath();
          ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.save();
          ctx.clip();
          ctx.drawImage(
            avatar,
            centerX - avatarSize / 2,
            centerY - avatarSize / 2,
            avatarSize,
            avatarSize
          );
          ctx.restore();

          // Borda branca
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = avatarSize * 0.03;
          ctx.stroke();

          // Nome de usuário centralizado abaixo
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const fontSize = avatarSize * 0.18;
          ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;

          ctx.fillText(
            member.user.username,
            centerX,
            centerY + avatarSize / 2 + 20 // Ajuste fino
          );

          // Envia a imagem
          const buffer = canvas.toBuffer('image/png');
          await canal.send({
            files: [{
              attachment: buffer,
              name: 'welcome.png'
            }],
            content: `${member} ${config.boasVindas.mensagem ? config.boasVindas.mensagem.replace('{servidor}', member.guild.name) : ''}`
          });

        } catch (imgError) {
          console.error('Erro ao processar imagem:', imgError);
          const mensagem = `${member} ${config.boasVindas.mensagem ? 
            config.boasVindas.mensagem.replace('{servidor}', member.guild.name) : 
            'Bem-vindo ao servidor!'}`;
          await canal.send(mensagem);
        }
      } else {
        const mensagem = `${member} ${config.boasVindas.mensagem ? 
          config.boasVindas.mensagem.replace('{servidor}', member.guild.name) : 
          'Bem-vindo ao servidor!'}`;
        await canal.send(mensagem);
      }
    } catch (error) {
      console.error('Erro no evento de boas-vindas:', error);
    }
  });
};
