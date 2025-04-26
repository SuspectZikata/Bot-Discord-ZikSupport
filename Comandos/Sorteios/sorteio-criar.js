const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name: 'sorteio-criar',
  description: '📝 Cria um novo sorteio (não publica)',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'duracao',
      description: 'Duração em horas (1-720)',
      type: ApplicationCommandOptionType.Number,
      required: true,
      min_value: 1,
      max_value: 720
    },
    {
      name: 'vencedores',
      description: 'Número de vencedores (1-20)',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      max_value: 20
    },
    {
      name: 'cargo',
      description: 'Cargo necessário para participar',
      type: ApplicationCommandOptionType.Role
    },
    {
      name: 'imagem',
      description: 'URL da imagem do prêmio',
      type: ApplicationCommandOptionType.String
    }
  ],

  async run(client, interaction) {
    // Criar o modal para título e prêmio
    const modal = new ModalBuilder()
      .setCustomId('giveawayForm')
      .setTitle('Criar Sorteio');

    // Componentes do modal
    const titleInput = new TextInputBuilder()
      .setCustomId('giveawayTitle')
      .setLabel("Título do Sorteio")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100);

    const prizeInput = new TextInputBuilder()
      .setCustomId('giveawayPrize')
      .setLabel("Descrição do Prêmio")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(4000);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(prizeInput);

    modal.addComponents(firstActionRow, secondActionRow);

    // Mostrar o modal
    await interaction.showModal(modal);

    // Coletar a resposta do modal
    const submitted = await interaction.awaitModalSubmit({
      time: 60000,
      filter: i => i.user.id === interaction.user.id,
    }).catch(error => {
      console.error('Erro ao coletar modal:', error);
      return null;
    });

    if (!submitted) return;

    // Processar os dados do modal e das opções do comando
    const title = submitted.fields.getTextInputValue('giveawayTitle');
    const prize = submitted.fields.getTextInputValue('giveawayPrize');
    
    const imageUrl = interaction.options.getString('imagem');
    if (imageUrl && !/^https?:\/\/.+\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(imageUrl)) {
      return submitted.reply({
        content: '❌ URL de imagem inválida! Use JPG, PNG ou GIF.',
        flags: MessageFlags.Ephemeral
      });
    }

    const duration = interaction.options.getNumber('duracao');
    const endTime = new Date(Date.now() + duration * 3600000);

    const giveaway = new Giveaway({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      title: title,
      prize: prize,
      imageUrl: imageUrl || null,
      endTime,
      winnerCount: interaction.options.getInteger('vencedores') || 1,
      requiredRoles: interaction.options.getRole('cargo') ? [interaction.options.getRole('cargo').id] : [],
      hostId: interaction.user.id,
      hostUsername: interaction.user.username,
      status: 'pending'
    });

    await giveaway.save();

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📝 Rascunho de Sorteio Criado')
      .setDescription(`**${giveaway.title}**\n${giveaway.prize}`)
      .addFields(
        { name: '⏳ Duração', value: `${duration} horas`, inline: true },
        { name: '🎁 Vencedores', value: `${giveaway.winnerCount}`, inline: true },
        { name: '🔒 Requisitos', value: giveaway.requiredRoles.length ? `<@&${giveaway.requiredRoles[0]}>` : 'Nenhum', inline: true }
      )
      .setFooter({ text: `ID: ${giveaway._id} • Criado por ${interaction.user.username}` });

    await submitted.reply({
      content: '📝 Sorteio criado como rascunho. Use `/sorteio-enviar` para publicar.',
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};