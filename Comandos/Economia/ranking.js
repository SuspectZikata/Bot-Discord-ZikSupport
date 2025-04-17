const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const User = require('../../models/User');

module.exports = {
  name: 'ranking',
  description: 'Mostra o ranking dos usuários com mais estrelas.',
  type: 1,

  run: async (client, interaction) => {
    try {
      await interaction.deferReply();

      const topUsers = await User.find({}).sort({ stars: -1 }).limit(5).exec();

      const width = 1280;
      const height = 720;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const fontFamily = 'Arial';

      // Fundo personalizado
      const backgroundURL = 'https://raw.githubusercontent.com/SuspectZikata/Imagens-ZikBot/refs/heads/main/ZikGuild/RankBackgroundGuild.png';
      const fallbackAvatarURL = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
      const emojiImage = await loadImage(path.join(__dirname, '../../emojis/estrela.png'));

      async function loadBackground() {
        try {
          const bg = await loadImage(backgroundURL);
          ctx.drawImage(bg, 0, 0, width, height);
        } catch (e) {
          console.warn('Erro ao carregar imagem de fundo, usando cor padrão:', e);
          ctx.fillStyle = '#ff90d0';
          ctx.fillRect(0, 0, width, height);
        }
      }

      await loadBackground();

      const positions = [
        { x: 100, y: 120 - 100, size: 175 },
        { x: 100, y: 200, size: 150 },
        { x: 100, y: 365, size: 125 },
        { x: 100, y: 545 - 50, size: 75 },
        { x: 100, y: 635 - 50, size: 75 },
      ];

      for (let i = 0; i < 5; i++) {
        const pos = positions[i];
        const userData = topUsers[i];

        ctx.fillStyle = '#000';
        ctx.font = `${i < 3 ? 42 : 26}px "${fontFamily}"`;
        ctx.textAlign = 'left';

        let avatarImage;
        let username = 'Disponível';
        let starCount = '---';

        if (userData) {
          try {
            const user = await client.users.fetch(userData.userId);
            username = user.username.length > 20 ? user.username.slice(0, 20) + '...' : user.username;
            starCount = `${userData.stars}`;
            avatarImage = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
          } catch (e) {
            console.warn('Erro ao buscar usuário:', e);
            avatarImage = await loadImage(fallbackAvatarURL);
          }
        } else {
          avatarImage = await loadImage(fallbackAvatarURL);
        }

        // Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x + pos.size / 2, pos.y + pos.size / 2, pos.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, pos.x, pos.y, pos.size, pos.size);
        ctx.restore();

        // Nome
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.font = `${i < 3 ? 35 : 25}px "${fontFamily}"`;
        ctx.textAlign = 'left';
        ctx.fillText(username, pos.x + pos.size + 20, pos.y + pos.size / 1.6);

        // Estrelas (número + emoji como imagem)
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.font = `${i < 3 ? 35 : 25}px "${fontFamily}"`;
        ctx.textAlign = 'left';

        const starY = pos.y + pos.size / 1.6;
        ctx.fillText(starCount, 650, starY);

        // emoji ao lado do número
        const starTextWidth = ctx.measureText(starCount).width;
        const emojiSize = i < 3 ? 35 : 25;
        ctx.drawImage(emojiImage, 650 + starTextWidth + 10, starY - emojiSize + 5, emojiSize, emojiSize);
      }

      // Rodapé
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `18px "${fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.fillText(`Atualizado em ${new Date().toLocaleDateString('pt-BR')}`, width / 2, height - 15);

      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'ranking.png' });
      await interaction.editReply({
        content: '🌟 Ranking atualizado!',
        files: [attachment]
      });

    } catch (error) {
      console.error('Erro no comando de ranking:', error);
      await interaction.editReply('Houve um erro ao gerar o ranking.');
    }
  }
};
