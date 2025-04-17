const Form = require('../models/Form');
const { MessageFlags } = require("discord.js");

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (!interaction.customId.startsWith('form_config_')) return;

    const formName = interaction.customId.replace('form_config_', '');
    let form = await Form.findOne({ formName });

    if (!form) {
      form = new Form({ formName });
    }

    try {
      form.description = interaction.fields.getTextInputValue('description') || '';
      form.categoryId = interaction.fields.getTextInputValue('categoryId');
      form.responseChannelId = interaction.fields.getTextInputValue('responseChannelId');
      form.statusChannelId = interaction.fields.getTextInputValue('statusChannelId');
      form.timeLimit = parseInt(interaction.fields.getTextInputValue('timeLimit')) || 600;

      await form.save();

      await interaction.reply({
        content: `✅ Formulário **${formName}** salvo com sucesso!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(`[FormModalHandler] Erro ao salvar o formulário:`, error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao salvar o formulário. Verifique os dados e tente novamente.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
