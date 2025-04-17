
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Form = require('../../models/Form');

module.exports = {
  name: 'formquestions',
  description: '[ADMIN] Gerencia as perguntas de um formulário',
  type: 1,
  options: [
    {
      name: 'nome',
      description: 'Nome do formulário',
      type: 3,
      required: true
    }
  ],
  defaultMemberPermissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }

    const formName = interaction.options.getString('nome');
    const form = await Form.findOne({ formName });

    if (!form) {
      return interaction.reply({
        content: `Formulário "${formName}" não encontrado. Crie-o primeiro com /formconfig.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📝 Perguntas do Formulário: ${formName}`)
      .setDescription(form.questions.length > 0 
        ? `Total de perguntas: ${form.questions.length}\n\n` +
          form.questions.map((q, i) => `${i+1}. ${q.questionText} (${q.questionType})`).join('\n')
        : 'Nenhuma pergunta adicionada ainda.')
      .setColor('#3498db');

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`form_add_question_${formName}`)
          .setLabel('Adicionar Pergunta')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`form_edit_questions_${formName}`)
          .setLabel('Editar Perguntas')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(form.questions.length === 0),
        new ButtonBuilder()
          .setCustomId(`form_reorder_questions_${formName}`)
          .setLabel('Reordenar Perguntas')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(form.questions.length < 2),
        new ButtonBuilder()
          .setCustomId(`form_remove_questions_${formName}`)
          .setLabel('Remover Pergunta')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(form.questions.length === 0)
      );
      

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
      flags: MessageFlags.Ephemeral
    });
  }
};