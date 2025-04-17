const { 
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  StringSelectMenuBuilder
} = require('discord.js');
const { MessageFlags } = require("discord.js");
const Form = require('../models/Form');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = (client) => {
  const tempResponses = new Map();
  const activeForms = new Map();
  
  // Configuração robusta do diretório de cache
  let imageCacheDir;
  try {
    imageCacheDir = path.join(os.tmpdir(), 'zikguild_image_cache');
    if (!fs.existsSync(imageCacheDir)) {
      fs.mkdirSync(imageCacheDir, { recursive: true, mode: 0o755 });
    }
    
    // Teste de escrita
    fs.writeFileSync(path.join(imageCacheDir, 'test.txt'), 'test');
    fs.unlinkSync(path.join(imageCacheDir, 'test.txt'));
    console.log(`📁 Diretório de cache configurado em: ${imageCacheDir}`);
  } catch (err) {
    console.error(`❌ Erro no diretório de cache primário: ${err.message}`);
    
    // Fallback para diretório dentro do projeto
    imageCacheDir = path.join(__dirname, '../../image_cache');
    if (!fs.existsSync(imageCacheDir)) {
      fs.mkdirSync(imageCacheDir, { recursive: true });
    }
    console.log(`📁 Usando diretório de cache alternativo: ${imageCacheDir}`);
  }

  async function handleTimeout(channel, userId, formName, tempResponses) {
    try {
      tempResponses.delete(`${userId}_${formName}`);
      activeForms.delete(userId);
      
      if (channel?.deletable) {
        await channel.send('⏰ Tempo esgotado! Formulário cancelado.').catch(() => {});
        await channel.delete().catch(() => {});
      }
    } catch (error) {
      console.error('Erro em handleTimeout:', error);
    }
  }

  async function downloadImage(url, userId, questionIndex) {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const ext = path.extname(url.split('?')[0]).split('.')[1] || 'jpg';
      const filename = `img_${userId}_${Date.now()}_q${questionIndex}.${ext}`;
      const filePath = path.join(imageCacheDir, filename);
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      return null;
    }
  }

  function processAnswer(message, question) {
    const rawInput = message.content.trim();

    if (question.required && !rawInput && message.attachments.size === 0) {
      throw new Error('Esta pergunta é obrigatória!');
    }

    switch (question.questionType) {
      case 'image': {
        const attachment = message.attachments.find(a => 
          a.contentType?.startsWith('image/') || 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url)
        );

        let imageUrl = null;

        if (attachment) {
          imageUrl = attachment.proxyURL || attachment.url;
        } else if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(rawInput)) {
          imageUrl = rawInput.split('?')[0];
        }

        if (!imageUrl) {
          throw new Error('Envie uma imagem válida (JPEG, PNG, GIF, WEBP) como anexo ou link.');
        }

        return imageUrl;
      }

      case 'number': {
        const num = parseFloat(rawInput);
        if (isNaN(num)) {
          throw new Error('Por favor, insira um número válido.');
        }
        return num.toString();
      }

      default:
        return rawInput || '';
    }
  }

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() || !interaction.customId.startsWith('start_form_')) return;
  
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral }); 

      const formName = interaction.customId.replace('start_form_', '');
      
      if (activeForms.has(interaction.user.id)) {
        const activeFormData = activeForms.get(interaction.user.id);
        const channel = await interaction.guild.channels.fetch(activeFormData.channelId).catch(() => null);
        
        if (channel) {
          return await interaction.editReply({
            content: 'Você já tem um formulário em andamento. Por favor, complete ou cancele o formulário atual antes de iniciar outro.',
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel('Ir para o formulário em andamento')
                  .setStyle(ButtonStyle.Link)
                  .setURL(`https://discord.com/channels/${interaction.guild.id}/${activeFormData.channelId}`)
              )
            ]
          });
        } else {
          activeForms.delete(interaction.user.id);
        }
      }
  
      const form = await Form.findOne({ formName });
  
      if (!form?.active) {
        return await interaction.editReply({
          content: 'Formulário indisponível. Contate um administrador.'
        });
      }

      activeForms.set(interaction.user.id, {
        formName,
        channelId: null
      });

      const channel = await interaction.guild.channels.create({
        name: `form-${formName}-${interaction.user.username}`.slice(0, 100),
        type: ChannelType.GuildText,
        parent: form.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      activeForms.set(interaction.user.id, {
        formName,
        channelId: channel.id
      });

      const embed = new EmbedBuilder()
        .setTitle(`📝 ${formName}`)
        .setDescription(form.description || 'Responda as perguntas abaixo:')
        .setFooter({ text: `Tempo limite: ${form.timeLimit} segundos por resposta` });

      await channel.send({
        content: `${interaction.user}, seu formulário foi iniciado!`,
        embeds: [embed]
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('📄 Formulário Iniciado')
            .setDescription(`Seu formulário **${formName}** foi iniciado com sucesso!`)
            .setColor('#3498db')
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('📍 Ir para o canal')
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
          )
        ]
      });

      tempResponses.set(`${interaction.user.id}_${formName}`, []);
      askQuestion(client, channel, interaction.user, form, 0, tempResponses);
    } catch (error) {
      console.error('Erro ao iniciar formulário:', error);
      activeForms.delete(interaction.user.id);
      await interaction.editReply({
        content: '❌ Ocorreu um erro ao iniciar o formulário.'
      }).catch(() => {});
    }
  });

  client.on('channelDelete', async channel => {
    for (const [userId, data] of activeForms.entries()) {
      if (data.channelId === channel.id) {
        activeForms.delete(userId);
        break;
      }
    }
  });

  async function askQuestion(client, channel, user, form, questionIndex, tempResponses) {
    try {
      if (!channel?.isTextBased()) {
        tempResponses.delete(`${user.id}_${form.formName}`);
        activeForms.delete(user.id);
        return;
      }

      if (questionIndex >= form.questions.length) {
        const embed = new EmbedBuilder()
          .setTitle('✅ Formulário Concluído!')
          .setDescription('Obrigado por suas respostas!')
          .setColor('#2ecc71');

        await channel.send({ embeds: [embed] });

        const responseChannel = await channel.guild.channels.fetch(form.responseChannelId).catch(() => null);
        if (responseChannel) {
          const responses = tempResponses.get(`${user.id}_${form.formName}`) || [];
          const responseEmbed = new EmbedBuilder()
            .setTitle(`📩 Nova Resposta: ${form.formName}`)
            .setDescription(`De: ${user.tag} (<@${user.id}> | ${user.id})`)
            .setColor('#3498db')
            .setTimestamp();

          let hasImage = false;

          for (let idx = 0; idx < responses.length; idx++) {
            const question = form.questions[idx];
            const answer = responses[idx];

            let value = 'Nenhuma resposta';
            if (Array.isArray(answer)) {
              value = answer.join(', ');
            } else if (answer !== null && answer !== undefined) {
              value = String(answer);
            }

            if (question.questionType === 'image' && typeof answer === 'string' && 
                /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(answer)) {
              responseEmbed.addFields({
                name: `📷 Pergunta ${idx + 1}: ${question.questionText}`,
                value: `[Clique para ver imagem](${answer})`
              });

              if (!hasImage) {
                responseEmbed.setImage(answer);
                hasImage = true;
              }
            } else {
              responseEmbed.addFields({
                name: `📌 Pergunta ${idx + 1}: ${question.questionText}`,
                value: value.length > 1024 ? `${value.substring(0, 1020)}...` : value
              });
            }
          }

          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`approve_${user.id}_${form.formName}`)
              .setLabel('Aprovar')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`reject_${user.id}_${form.formName}`)
              .setLabel('Rejeitar')
              .setStyle(ButtonStyle.Danger)
          );

          await responseChannel.send({
            embeds: [responseEmbed],
            components: [buttons]
          }).catch(() => {});
        }

        tempResponses.delete(`${user.id}_${form.formName}`);
        activeForms.delete(user.id);
        setTimeout(() => channel.delete().catch(() => {}), 30000);
        return;
      }

      const question = form.questions[questionIndex];
      await channel.send(`**Pergunta ${questionIndex + 1}:** ${question.questionText}`);

      if (['multiple_choice', 'single_choice'].includes(question.questionType)) {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`form_answer_${questionIndex}`)
          .setPlaceholder('Selecione sua(s) opção(ões)')
          .setMinValues(question.questionType === 'single_choice' ? 1 : 1)
          .setMaxValues(question.questionType === 'single_choice' ? 1 : question.options.length)
          .addOptions(
            question.options.map(option => ({
              label: option.length > 25 ? `${option.substring(0, 22)}...` : option,
              value: option
            }))
          );

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const message = await channel.send({
          content: 'Selecione abaixo:',
          components: [row]
        });

        const collector = message.createMessageComponentCollector({
          filter: i => i.user.id === user.id,
          time: form.timeLimit * 1000
        });

        collector.on('collect', async i => {
          try {
            if (!channel.isTextBased()) {
              collector.stop();
              return;
            }

            const answer = i.values;
            const key = `${user.id}_${form.formName}`;
            const answers = tempResponses.get(key) || [];
            answers.push(answer);
            tempResponses.set(key, answers);

            await i.deferUpdate(); // Adicionado deferUpdate para evitar timeout
            await message.edit({ components: [] }).catch(() => {});
            askQuestion(client, channel, user, form, questionIndex + 1, tempResponses);
          } catch (error) {
            console.error('Erro ao processar resposta:', error);
            await channel.send(`❌ Erro: ${error.message}`).catch(() => {});
            askQuestion(client, channel, user, form, questionIndex, tempResponses);
          }
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            handleTimeout(channel, user.id, form.formName, tempResponses);
          }
        });
      } else {
        const collector = channel.createMessageCollector({
          filter: m => m.author.id === user.id,
          time: form.timeLimit * 1000,
          max: 1
        });

        collector.on('collect', async m => {
          try {
            const answer = processAnswer(m, question);
            const key = `${user.id}_${form.formName}`;
            const answers = tempResponses.get(key) || [];
            
            if (question.questionType === 'image' && typeof answer === 'string') {
              await downloadImage(answer, user.id, questionIndex);
            }
            
            answers.push(answer);
            tempResponses.set(key, answers);

            await channel.send('✔️ Resposta registrada!').catch(() => {});
            askQuestion(client, channel, user, form, questionIndex + 1, tempResponses);
          } catch (error) {
            await channel.send(`❌ Erro: ${error.message}`).catch(() => {});
            askQuestion(client, channel, user, form, questionIndex, tempResponses);
          }
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            handleTimeout(channel, user.id, form.formName, tempResponses);
          }
        });
      }
    } catch (error) {
      console.error('Erro em askQuestion:', error);
      handleTimeout(channel, user.id, form.formName, tempResponses);
    }
  }

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
  
    try {
      const [action, userId, formName] = interaction.customId.split('_');
      if (action !== 'approve' && action !== 'reject') return;
    
      await interaction.deferUpdate(); // Adicionado deferUpdate para evitar timeout
    
      const form = await Form.findOne({ formName });
      if (!form) return;
    
      const statusChannelId = form.statusChannelId;
      if (!statusChannelId) return;
    
      const statusEmbed = new EmbedBuilder()
        .setTitle(`Formulário ${action === 'approve' ? 'Aprovado ✅' : 'Rejeitado ❌'}`)
        .setDescription(`Usuário: <@${userId}>\nFormulário: ${formName}`)
        .setColor(action === 'approve' ? '#2ecc71' : '#e74c3c');
    
      const channel = await interaction.guild.channels.fetch(statusChannelId).catch(() => null);
      if (channel) {
        await channel.send({
          content: `<@${userId}>`,
          embeds: [statusEmbed],
        }).catch(() => {});
      }
    
      await interaction.editReply({ components: [] }).catch(() => {});
    } catch (error) {
      console.error('Erro ao processar aprovação/rejeição:', error);
    }
  });
};