const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
  } = require('discord.js');
  const Form = require('../../models/Form');
  
  module.exports = {
    name: 'formlist',
    description: '[ADMIN] Lista todos os formulários disponíveis',
    type: 1,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  
    run: async (client, interaction) => {
      try {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            content: '❌ Você não tem permissão para usar este comando!',
            flags: MessageFlags.Ephemeral
          });
        }
  
        const forms = await Form.find({});
        if (forms.length === 0) {
          return interaction.reply({
            content: '⚠️ Nenhum formulário configurado ainda.\nUse `/formcreate` para criar um novo.',
            flags: MessageFlags.Ephemeral
          });
        }
  
        const embed = new EmbedBuilder()
          .setTitle('📋 Formulários Disponíveis')
          .setDescription('Veja abaixo todos os formulários configurados:')
          .setColor(0x3498db);
  
        forms.forEach(form => {
          embed.addFields({
            name: `📌 ${form.formName}`,
            value:
              `📝 **Descrição:** ${form.description || 'Sem descrição'}\n` +
              `⏱️ **Tempo limite:** ${form.timeLimit || 'Não definido'} segundos\n` +
              `📂 **Categoria:** <#${form.categoryId || 'não definida'}>\n` +
              `💬 **Canal de respostas:** <#${form.responseChannelId || 'não definido'}>\n` +
              `🔄 **Canal de status:** <#${form.statusChannelId || 'não definido'}>`,
            inline: false
          });
        });
  
        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
  
      } catch (error) {
        console.error('Erro ao listar formulários:', error);
        return interaction.reply({
          content: '❌ Ocorreu um erro ao tentar listar os formulários.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  };
  