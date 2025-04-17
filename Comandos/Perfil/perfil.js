const { AttachmentBuilder, MessageFlags } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const sharp = require('sharp');
const { UserInventory, Background, Role } = require('../../models/ShopItems');
const User = require('../../models/User');
const fs = require('fs');

// Configurações
const PROCESSING_TIMEOUT = 5000;
const ORDER_FILE = path.join(__dirname, '../../roleOrder.json');
const starImagePath = path.join(__dirname, '../../emojis/estrela.png');


// Função para carregar a ordem dos cargos
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

// Função para carregar imagens com tratamento de erro
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
      const startTime = Date.now();

      // Obter dados do usuário com timeout
      const [userInventory, userData, allUsers] = await Promise.race([
        Promise.all([
          UserInventory.findOne({ userId: user.id }),
          User.findOne({ userId: user.id }),
          User.find({}).sort({ stars: -1 }).exec()
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), PROCESSING_TIMEOUT))
      ]);

      // Canvas
      const width = 1920;
      const height = 1080;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const fontFamily = 'Arial';

      // Funções auxiliares para texto
      const applyText = (text, x, y, size = 48, isBold = false, color = '#FFFFFF') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.font = `${isBold ? 'bold ' : ''}${size}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      const applyCenteredText = (text, x, y, size = 48, isBold = false, color = '#FFFFFF') => {
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.font = `${isBold ? 'bold ' : ''}${size}px "${fontFamily}"`;
        ctx.fillText(text, x, y);
      };

      // Fundo
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

      // Layout principal
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(100, 100, width - 200, height - 200, 30);
      ctx.fill();

      // Avatar
      try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await loadImageWithConversion(avatarUrl);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 300, 150, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 150, 150, 300, 300);
        ctx.restore();

        ctx.strokeStyle = '#7289DA';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(300, 300, 155, 0, Math.PI * 2);
        ctx.stroke();
      } catch (error) {
        console.error('Erro ao carregar avatar:', error);
        ctx.fillStyle = '#7289DA';
        ctx.beginPath();
        ctx.arc(300, 300, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Informações do usuário
      const userRank = allUsers.findIndex(u => u.userId === user.id) + 1;
      const stars = userData?.stars || 0;

      applyText(user.username, 500, 250, 72, true);
      applyText(`#${userRank}`, 500, 310, 48, false, '#7289DA');

      // Linha divisória
      ctx.strokeStyle = '#7289DA';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(500, 350);
      ctx.lineTo(width - 200, 350);
      ctx.stroke();

      // Estrelas
      applyText(` ${stars} `, 575, 450, 48, false, '#FEE75C');

      try {
        const emojiImage = await loadImage(starImagePath);
        const textWidth = ctx.measureText(`${stars}`).width;
        const emojiSize = 42;
        ctx.drawImage(emojiImage, 400 + textWidth + 10, 445 - emojiSize + 10, emojiSize, emojiSize);
      } catch (e) {
        console.error('Erro ao carregar estrela:', e);
      }


      // Cargos do usuário (ORDENADOS)
      if (userInventory?.ownedRoles?.length > 0) {
        try {
          const roleOrder = loadRoleOrder();
          const allUserRoles = await Role.find({ _id: { $in: userInventory.ownedRoles } }).exec();
          
          // Ordena os cargos conforme a ordem definida
          const orderedRoles = [];
          const unorderedRoles = [...allUserRoles];
          
          // Primeiro adiciona na ordem definida
          for (const roleId of roleOrder.order) {
            const index = unorderedRoles.findIndex(r => r._id.toString() === roleId);
            if (index !== -1) {
              orderedRoles.push(unorderedRoles[index]);
              unorderedRoles.splice(index, 1);
            }
          }
          
          // Depois adiciona os que não estão na ordem definida
          orderedRoles.push(...unorderedRoles);
          
          const userRoles = orderedRoles.slice(0, 16); // Limita a 16 cargos para exibição
          const iconSize = 130;
          const textHeight = 30;
          const margin = 20;
          const startX = 500;
          const startY = 520;
          const maxPerRow = 8;
          
          let xPos = startX;
          let yPos = startY;
          let rolesShown = 0;
          
          for (const role of userRoles) {
            try {
              const roleIcon = await loadImageWithConversion(role.icon);
              ctx.drawImage(roleIcon, xPos, yPos, iconSize, iconSize);
              
              // Texto do cargo (com quebra de linha se necessário)
              const maxChars = 12;
              const textOffsetY = 35;
              const secondLineOffset = 60;
              
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
                yPos += iconSize + 80;
              }
              
            } catch (iconError) {
              console.error('Erro ao carregar ícone do cargo:', iconError);
              ctx.fillStyle = '#7289DA';
              ctx.fillRect(xPos, yPos, iconSize, iconSize);
              applyCenteredText(role.name, xPos + (iconSize / 2), yPos + iconSize + 25, 24, true);
              
              xPos += iconSize + margin;
              rolesShown++;
              if (rolesShown % maxPerRow === 0) {
                xPos = startX;
                yPos += iconSize + 80;
              }
            }
          }
          
          if (userInventory.ownedRoles.length > 16) {
            applyCenteredText(`+${userInventory.ownedRoles.length - 16}`, xPos + 60, yPos + (iconSize / 2), 36);
          }
          
        } catch (error) {
          console.error('Erro ao carregar cargos:', error);
        }
      }

      // Rodapé
      applyCenteredText('Perfil • ZikBot', width / 2, height - 120, 32);

      // Criar attachment e enviar
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });
      
      clearTimeout(timeout);
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: ' ',
          files: [attachment] 
        }).catch(error => {
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
        await interaction.reply({
          content: errorMessage,
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      } else {
        await interaction.editReply({
          content: errorMessage
        }).catch(error => {
          if (error.code !== 10062) console.error('Erro ao enviar mensagem de erro:', error);
        });
      }
    }
  }
};