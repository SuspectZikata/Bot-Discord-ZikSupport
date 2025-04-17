const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { MessageFlags } = require("discord.js");
const Form = require('../models/Form');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    try {
      if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

      const { customId } = interaction;

      // Função auxiliar para extrair o nome do formulário
      const extractFormName = (prefix, id) => id.substring(prefix.length);

      // === Handler para adicionar pergunta ===
      if (interaction.isButton() && customId.startsWith('form_add_question_')) {
        const formName = extractFormName('form_add_question_', customId);
        const form = await Form.findOne({ formName });
        if (!form) {
          return interaction.reply({ content: '❌ Formulário não encontrado.', flags: MessageFlags.Ephemeral });
        }

        const modal = new ModalBuilder()
          .setCustomId(`form_add_q_modal_${formName}`)
          .setTitle(`Nova Pergunta - ${formName}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('questionText')
                .setLabel('Texto da Pergunta')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('questionType')
                .setLabel('(text-number-image-multiple/single_choice)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Ex: multiple_choice')
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('options')
                .setLabel('Opções (separadas por vírgula)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setPlaceholder('Apenas para tipos de escolha')
            )
          );

        return interaction.showModal(modal);
      }

      // === Handler para editar perguntas ===
      if (interaction.isButton() && customId.startsWith('form_edit_questions_')) {
        const formName = extractFormName('form_edit_questions_', customId);
        const form = await Form.findOne({ formName });
        
        if (!form || form.questions.length === 0) {
          return interaction.reply({ content: '❌ Nenhuma pergunta para editar.', flags: MessageFlags.Ephemeral });
        }

        const options = form.questions.map((q, i) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}. ${q.questionText.slice(0, 45)}${q.questionText.length > 45 ? '...' : ''}`)
            .setValue(i.toString())
            .setDescription(`Tipo: ${q.questionType}`)
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`edit_select_${formName}`)
          .setPlaceholder('Selecione a pergunta para editar')
          .addOptions(options);

        return interaction.reply({
          content: 'Selecione a pergunta que deseja editar:',
          components: [new ActionRowBuilder().addComponents(selectMenu)],
          flags: MessageFlags.Ephemeral
        });
      }

      // === Handler para reordenar perguntas ===
      if (interaction.isButton() && customId.startsWith('form_reorder_questions_')) {
        const formName = extractFormName('form_reorder_questions_', customId);
        const form = await Form.findOne({ formName });
        
        if (!form || form.questions.length < 2) {
          return interaction.reply({ 
            content: '❌ Pelo menos duas perguntas são necessárias para reordenar.', 
            flags: MessageFlags.Ephemeral 
          });
        }

        const questionList = form.questions.map((q, i) => `${i + 1}. ${q.questionText}`).join('\n');

        await interaction.reply({
          content: `🔃 Envie a nova ordem numérica (ex: \`2,1,3\`):\n\`\`\`\n${questionList}\n\`\`\``,
          flags: MessageFlags.Ephemeral
        });

        const collector = interaction.channel.createMessageCollector({
          filter: m => m.author.id === interaction.user.id,
          time: 60000,
          max: 1
        });

        collector.on('collect', async msg => {
          try {
            const indices = msg.content.split(',')
              .map(s => parseInt(s.trim()) - 1)
              .filter(n => !isNaN(n));

            if (indices.length !== form.questions.length || 
                new Set(indices).size !== indices.length ||
                indices.some(i => i < 0 || i >= form.questions.length)) {
              return msg.reply({ content: '❌ Ordem inválida. Use números únicos dentro do intervalo.', flags: MessageFlags.Ephemeral });
            }

            form.questions = indices.map(i => form.questions[i]);
            await form.save();
            return msg.reply({ content: '✅ Perguntas reordenadas com sucesso!', flags: MessageFlags.Ephemeral });
          } catch (error) {
            console.error('Erro ao reordenar perguntas:', error);
            return msg.reply({ content: '❌ Ocorreu um erro ao reordenar as perguntas.', flags: MessageFlags.Ephemeral });
          }
        });

        return;
      }

      // === Handler para remover perguntas ===
      if (interaction.isButton() && customId.startsWith('form_remove_questions_')) {
        const formName = extractFormName('form_remove_questions_', customId);
        const form = await Form.findOne({ formName });
        
        if (!form || form.questions.length === 0) {
          return interaction.reply({ content: '❌ Nenhuma pergunta para remover.', flags: MessageFlags.Ephemeral });
        }

        const options = form.questions.map((q, i) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}. ${q.questionText.slice(0, 45)}${q.questionText.length > 45 ? '...' : ''}`)
            .setValue(i.toString())
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`remove_select_${formName}`)
          .setPlaceholder('Selecione a pergunta para remover')
          .addOptions(options);

        return interaction.reply({
          content: 'Selecione a pergunta que deseja **remover**:',
          components: [new ActionRowBuilder().addComponents(selectMenu)],
          flags: MessageFlags.Ephemeral
        });
      }

      // === Handler para seleção de edição ===
      if (interaction.isStringSelectMenu() && customId.startsWith('edit_select_')) {
        const formName = extractFormName('edit_select_', customId);
        const form = await Form.findOne({ formName });
        const index = parseInt(interaction.values[0]);
        
        if (!form || index < 0 || index >= form.questions.length) {
          return interaction.reply({ content: '❌ Pergunta inválida.', flags: MessageFlags.Ephemeral });
        }

        const question = form.questions[index];

        const modal = new ModalBuilder()
          .setCustomId(`edit_question_modal_${formName}_${index}`)
          .setTitle(`Editar Pergunta ${index + 1}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('questionText')
                .setLabel('Texto da Pergunta')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(question.questionText)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('questionType')
                .setLabel('Tipo da Pergunta')
                .setStyle(TextInputStyle.Short)
                .setValue(question.questionType)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('options')
                .setLabel('Opções (separadas por vírgula)')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(question.options?.join(', ') || '')
                .setRequired(false)
            )
          );

        return interaction.showModal(modal);
      }

      // === Handler para seleção de remoção ===
      if (interaction.isStringSelectMenu() && customId.startsWith('remove_select_')) {
        const formName = extractFormName('remove_select_', customId);
        const form = await Form.findOne({ formName });
        const index = parseInt(interaction.values[0]);
        
        if (!form || index < 0 || index >= form.questions.length) {
          return interaction.reply({ content: '❌ Pergunta inválida.', flags: MessageFlags.Ephemeral });
        }

        const removedQuestion = form.questions.splice(index, 1)[0];
        await form.save();

        return interaction.reply({
          content: `🗑️ Pergunta removida: **${removedQuestion.questionText}**`,
          flags: MessageFlags.Ephemeral
        });
      }

      // === Handler para submissão de modal ===
      if (interaction.isModalSubmit()) {
        const validTypes = ['text', 'image', 'number', 'multiple_choice', 'single_choice'];
        
        if (customId.startsWith('form_add_q_modal_')) {
          const formName = extractFormName('form_add_q_modal_', customId);
          const form = await Form.findOne({ formName });
          if (!form) {
            return interaction.reply({ content: '❌ Formulário não encontrado.', flags: MessageFlags.Ephemeral });
          }

          const questionText = interaction.fields.getTextInputValue('questionText');
          const questionType = interaction.fields.getTextInputValue('questionType').toLowerCase();
          const optionsRaw = interaction.fields.getTextInputValue('options');

          if (!validTypes.includes(questionType)) {
            return interaction.reply({
              content: `❌ Tipo inválido. Use: ${validTypes.join(', ')}.`,
              flags: MessageFlags.Ephemeral
            });
          }

          const newQuestion = { 
            questionText, 
            questionType, 
            required: true 
          };

          if (['multiple_choice', 'single_choice'].includes(questionType)) {
            const options = optionsRaw.split(',')
              .map(o => o.trim())
              .filter(Boolean);
            
            if (options.length < 2) {
              return interaction.reply({ 
                content: '❌ Forneça pelo menos duas opções para tipos de escolha.', 
                flags: MessageFlags.Ephemeral 
              });
            }
            newQuestion.options = options;
          }

          form.questions.push(newQuestion);
          await form.save();

          return interaction.reply({ 
            content: '✅ Pergunta adicionada com sucesso!', 
            flags: MessageFlags.Ephemeral 
          });
        }

        if (customId.startsWith('edit_question_modal_')) {
          const parts = customId.split('_');
          const formName = parts.slice(3, -1).join('_');
          const index = parseInt(parts[parts.length - 1]);
          
          const form = await Form.findOne({ formName });
          if (!form || index < 0 || index >= form.questions.length) {
            return interaction.reply({ content: '❌ Pergunta inválida.', flags: MessageFlags.Ephemeral });
          }

          const questionText = interaction.fields.getTextInputValue('questionText');
          const questionType = interaction.fields.getTextInputValue('questionType').toLowerCase();
          const optionsRaw = interaction.fields.getTextInputValue('options');

          if (!validTypes.includes(questionType)) {
            return interaction.reply({
              content: `❌ Tipo inválido. Use: ${validTypes.join(', ')}.`,
              flags: MessageFlags.Ephemeral
            });
          }

          const updatedQuestion = { 
            questionText, 
            questionType, 
            required: true 
          };

          if (['multiple_choice', 'single_choice'].includes(questionType)) {
            const options = optionsRaw.split(',')
              .map(o => o.trim())
              .filter(Boolean);
            
            if (options.length < 2) {
              return interaction.reply({ 
                content: '❌ Forneça pelo menos duas opções para tipos de escolha.', 
                flags: MessageFlags.Ephemeral 
              });
            }
            updatedQuestion.options = options;
          } else {
            updatedQuestion.options = undefined;
          }

          form.questions[index] = updatedQuestion;
          await form.save();

          return interaction.reply({ 
            content: `✅ Pergunta ${index + 1} atualizada com sucesso!`, 
            flags: MessageFlags.Ephemeral 
          });
        }
      }
    } catch (error) {
      console.error('Erro no handler de formulários:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ 
          content: '❌ Ocorreu um erro ao processar sua solicitação.', 
          flags: MessageFlags.Ephemeral 
        });
      } else {
        await interaction.reply({ 
          content: '❌ Ocorreu um erro ao processar sua solicitação.', 
          flags: MessageFlags.Ephemeral 
        });
      }
    }
  });
};