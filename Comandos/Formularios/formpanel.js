
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Form = require('../../models/Form');

module.exports = {
  name: 'formpanel',
  description: '[ADMIN] Cria um painel para um formulário',
  type: 1,
  options: [
    {
      name: 'nome',
      description: 'Nome do formulário',
      type: 3,
      required: true
    },
    {
      name: 'canal',
      description: 'Canal onde o painel será enviado',
      type: 7,
      channelTypes: [0, 5], // TEXT_CHANNEL ou NEWS_CHANNEL
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
    const channel = interaction.options.getChannel('canal');

    const form = await Form.findOne({ formName });

    if (!form) {
      return interaction.reply({
        content: `Formulário "${formName}" não encontrado. Crie-o primeiro com /formconfig.`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (!form.active) {
      return interaction.reply({
        content: `O formulário "${formName}" está desativado. Ative-o primeiro.`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (form.questions.length === 0) {
      return interaction.reply({
        content: `O formulário "${formName}" não tem perguntas. Adicione perguntas primeiro.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(formName)
      .setDescription(form.description || 'Preencha o formulário abaixo')
      .setColor('#3498db')
      .setFooter({ text: `Tempo limite: ${form.timeLimit} segundos por resposta` });

    const button = new ButtonBuilder()
      .setCustomId(`start_form_${formName}`)
      .setLabel(form.buttonLabel)
      .setStyle(ButtonStyle[form.buttonColor]);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `✅ Painel do formulário "${formName}" enviado para ${channel}!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Erro ao enviar painel para ${channel}. Verifique as permissões.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};