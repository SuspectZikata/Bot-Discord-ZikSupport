const { AttachmentBuilder, MessageFlags } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const sharp = require('sharp');
const { UserInventory, Background, Role } = require('../../models/ShopItems');
const User = require('../../models/User');
const fs = require('fs');

const PROCESSING_TIMEOUT = 5000;
const ORDER_FILE = path.join(__dirname, '../../roleOrder.json');
const starImagePath = path.join(__dirname, '../../emojis/estrela.png');

function loadRoleOrder() {
  try {
    if (!fs.existsSync(ORDER_FILE)) {
      fs.writeFileSync(ORDER_FILE, JSON.stringify({ order: [] }, null, 2));
      return { order: [] };
    }
    return JSON.parse(fs.readFileSync(ORDER_FILE));
  } catch (error) {
    console.error('Erro ao carregar ordem de cargos:', error);
    return { order: [] };
  }
}

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
  name: 'perfil',
  description: 'Mostra seu perfil personalizado com seus cargos e conquistas',
  type: 1,

  run: async (client, interaction) => {
    const timeout = setTimeout(async () => {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⌛ O processamento do perfil está demorando mais que o esperado...',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }
    }, 2500);

    try {
      await interaction.deferReply().catch(error => {
        if (error.code === 10062) return;
        throw error;
      });

      const user = interaction.user;
      const [userInventory, userData, allUsers] = await Promise.race([
        Promise.all([
          UserInventory.findOne({ userId: user.id }),
          User.findOne({ userId: user.id }),
          User.find({}).sort({ stars: -1 }).exec()
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), PROCESSING_TIMEOUT))
      ]);

      const scale = 0.6667;
      const s = (v) => v * scale;
      const width = 1920 * scale;
      const height = 1080 * scale;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const fontFamily = 'Arial';

      const applyText = (text, x, y, size = 48, isBold = false, color = '#FFFFFF') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.font = `${isBold ? 'bold ' : ''}${size * scale}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      const applyCenteredText = (text, x, y, size = 48, isBold = false, color = '#FFFFFF') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.font = `${isBold ? 'bold ' : ''}${size * scale}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      try {
        let backgroundImage;
        if (userInventory?.equippedBackground) {
          const bgData = await Background.findOne({ _id: userInventory.equippedBackground }).exec();
          if (bgData?.imageUrl) {
            backgroundImage = await loadImageWithConversion(bgData.imageUrl);
          }
        }
        if (!backgroundImage) {
          backgroundImage = await loadImageWithConversion(
            'https://raw.githubusercontent.com/SuspectZikata/Imagens-ZikBot/refs/heads/main/ZikGuild/PerfilBackgroundGuild.png'
          );
        }
        ctx.filter = 'blur(4px) brightness(60%)';
        ctx.drawImage(backgroundImage, 0, 0, width, height);
        ctx.filter = 'none';
      } catch (error) {
        console.error('Erro ao carregar fundo:', error);
        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(s(100), s(100), width - s(200), height - s(200), s(30));
      ctx.fill();

      try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await loadImageWithConversion(avatarUrl);

        ctx.save();
        ctx.beginPath();
        ctx.arc(s(300), s(300), s(150), 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, s(150), s(150), s(300), s(300));
        ctx.restore();

        ctx.strokeStyle = '#7289DA';
        ctx.lineWidth = s(10);
        ctx.beginPath();
        ctx.arc(s(300), s(300), s(155), 0, Math.PI * 2);
        ctx.stroke();
      } catch (error) {
        console.error('Erro ao carregar avatar:', error);
        ctx.fillStyle = '#7289DA';
        ctx.beginPath();
        ctx.arc(s(300), s(300), s(150), 0, Math.PI * 2);
        ctx.fill();
      }

      const userRank = allUsers.findIndex(u => u.userId === user.id) + 1;
      const stars = userData?.stars || 0;

      applyText(user.username, s(500), s(250), 72, true);
      applyText(`#${userRank}`, s(500), s(310), 48, false, '#7289DA');

      ctx.strokeStyle = '#7289DA';
      ctx.lineWidth = s(3);
      ctx.beginPath();
      ctx.moveTo(s(500), s(350));
      ctx.lineTo(width - s(200), s(350));
      ctx.stroke();

      applyText(` ${stars} `, s(575), s(450), 48, false, '#FEE75C');

      try {
        const emojiImage = await loadImage(starImagePath);
        const textWidth = ctx.measureText(`${stars}`).width;
        const emojiSize = s(42);
        ctx.drawImage(emojiImage, s(400) + textWidth + s(10), s(445 - 42 + 10), emojiSize, emojiSize);
      } catch (e) {
        console.error('Erro ao carregar estrela:', e);
      }

      if (userInventory?.ownedRoles?.length > 0) {
        try {
          const roleOrder = loadRoleOrder();
          const allUserRoles = await Role.find({ _id: { $in: userInventory.ownedRoles } }).exec();
          const orderedRoles = [];
          const unorderedRoles = [...allUserRoles];

          for (const roleId of roleOrder.order) {
            const index = unorderedRoles.findIndex(r => r._id.toString() === roleId);
            if (index !== -1) {
              orderedRoles.push(unorderedRoles[index]);
              unorderedRoles.splice(index, 1);
            }
          }

          orderedRoles.push(...unorderedRoles);

          const userRoles = orderedRoles.slice(0, 16);
          const iconSize = s(130);
          const margin = s(20);
          const startX = s(500);
          const startY = s(520);
          const textOffsetY = s(35);
          const secondLineOffset = s(60);
          const maxPerRow = 8;

          let xPos = startX;
          let yPos = startY;
          let rolesShown = 0;

          for (const role of userRoles) {
            try {
              const roleIcon = await loadImageWithConversion(role.icon);
              ctx.drawImage(roleIcon, xPos, yPos, iconSize, iconSize);

              const maxChars = 12;
              if (role.name.length > maxChars) {
                const firstPart = role.name.substring(0, maxChars);
                const secondPart = role.name.substring(maxChars);
                applyCenteredText(firstPart, xPos + (iconSize / 2), yPos + iconSize + textOffsetY, 28);
                applyCenteredText(secondPart, xPos + (iconSize / 2), yPos + iconSize + secondLineOffset, 28);
              } else {
                applyCenteredText(role.name, xPos + (iconSize / 2), yPos + iconSize + textOffsetY, 28);
              }

              xPos += iconSize + margin;
              rolesShown++;
              if (rolesShown % maxPerRow === 0) {
                xPos = startX;
                yPos += iconSize + s(80);
              }
            } catch (iconError) {
              console.error('Erro ao carregar ícone do cargo:', iconError);
              ctx.fillStyle = '#7289DA';
              ctx.fillRect(xPos, yPos, iconSize, iconSize);
              applyCenteredText(role.name, xPos + (iconSize / 2), yPos + iconSize + s(25), 24, true);

              xPos += iconSize + margin;
              rolesShown++;
              if (rolesShown % maxPerRow === 0) {
                xPos = startX;
                yPos += iconSize + s(80);
              }
            }
          }

          if (userInventory.ownedRoles.length > 16) {
            applyCenteredText(`+${userInventory.ownedRoles.length - 16}`, xPos + s(60), yPos + (iconSize / 2), 36);
          }

        } catch (error) {
          console.error('Erro ao carregar cargos:', error);
        }
      }

      applyCenteredText('Perfil • ZikBot', width / 2, height - s(120), 32);
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });

      clearTimeout(timeout);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: ' ', files: [attachment] }).catch(error => {
          if (error.code !== 10062) console.error('Erro ao editar resposta:', error);
        });
      }

    } catch (error) {
      clearTimeout(timeout);
      console.error('Erro no comando perfil:', error);
      const errorMessage = error.message.includes('Timeout')
        ? '⌛ O tempo para gerar seu perfil expirou. Tente novamente!'
        : '❌ Ocorreu um erro ao gerar seu perfil!';

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
