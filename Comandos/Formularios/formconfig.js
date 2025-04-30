const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Form = require('../../models/Form');

module.exports = {
  name: 'formconfig',
  description: '[ADMIN] Configura um novo formulário ou edita um existente',
  type: 1,
  options: [
    {
      name: 'nome',
      description: 'Nome do formulário (ou deixe vazio para listar)',
      type: 3,
      required: false
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

    if (!formName) {
      const forms = await Form.find({});
      if (forms.length === 0) {
        return interaction.reply({
          content: 'Nenhum formulário configurado ainda. Use `/formconfig nome` para criar um novo.',
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Formulários Disponíveis')
        .setDescription('Clique nos botões abaixo para editar ou visualizar um formulário')
        .setColor('#3498db');

      const buttons = forms.map(form =>
        new ButtonBuilder()
          .setCustomId(`form_edit_${form.formName}`)
          .setLabel(form.formName)
          .setStyle(ButtonStyle.Primary)
      );

      const rows = [];
      while (buttons.length > 0) {
        rows.push(new ActionRowBuilder().addComponents(buttons.splice(0, 5)));
      }

      return interaction.reply({
        embeds: [embed],
        components: rows,
        flags: MessageFlags.Ephemeral
      });
    }

    // Criar modal de configuração
    let form = await Form.findOne({ formName });
    const isNew = !form;
    if (isNew) form = new Form({ formName });

    const modal = new ModalBuilder()
      .setCustomId(`form_config_${formName}`)
      .setTitle(`${isNew ? 'Criar' : 'Editar'} Formulário: ${formName}`);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel("Descrição do Formulário")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(form.description || '')
      .setRequired(false);

    const categoryInput = new TextInputBuilder()
      .setCustomId('categoryId')
      .setLabel("ID da Categoria para Canais")
      .setStyle(TextInputStyle.Short)
      .setValue(form.categoryId || '')
      .setRequired(true);

    const responseChannelInput = new TextInputBuilder()
      .setCustomId('responseChannelId')
      .setLabel("ID do Canal de Respostas")
      .setStyle(TextInputStyle.Short)
      .setValue(form.responseChannelId || '')
      .setRequired(true);

    const statusChannelInput = new TextInputBuilder()
      .setCustomId('statusChannelId')
      .setLabel("ID do Canal de Status")
      .setStyle(TextInputStyle.Short)
      .setValue(form.statusChannelId || '')
      .setRequired(true);

    const timeLimitInput = new TextInputBuilder()
      .setCustomId('timeLimit')
      .setLabel("Tempo Limite (segundos)")
      .setStyle(TextInputStyle.Short)
      .setValue(form.timeLimit?.toString() || '600')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(categoryInput),
      new ActionRowBuilder().addComponents(responseChannelInput),
      new ActionRowBuilder().addComponents(statusChannelInput),
      new ActionRowBuilder().addComponents(timeLimitInput)
    );

    await interaction.showModal(modal);

    // Adiciona listener TEMPORÁRIO só pra esse modal
    const filter = i => i.customId === `form_config_${formName}` && i.user.id === interaction.user.id;

    interaction.client.once('interactionCreate', async modalInteraction => {
      if (!filter(modalInteraction)) return;

      try {
        const updatedForm = await Form.findOne({ formName }) || new Form({ formName });

        updatedForm.description = modalInteraction.fields.getTextInputValue('description') || '';
        updatedForm.categoryId = modalInteraction.fields.getTextInputValue('categoryId');
        updatedForm.responseChannelId = modalInteraction.fields.getTextInputValue('responseChannelId');
        updatedForm.statusChannelId = modalInteraction.fields.getTextInputValue('statusChannelId');
        updatedForm.timeLimit = parseInt(modalInteraction.fields.getTextInputValue('timeLimit')) || 600;

        await updatedForm.save();

        await modalInteraction.reply({
          content: `✅ Formulário **${formName}** salvo com sucesso!`,
          flags: MessageFlags.Ephemeral
        });
      } catch (error) {
        console.error('Erro ao salvar formulário:', error);
        await modalInteraction.reply({
          content: '❌ Ocorreu um erro ao salvar o formulário.',
          flags: MessageFlags.Ephemeral
        });
      }
    });
  }
};
