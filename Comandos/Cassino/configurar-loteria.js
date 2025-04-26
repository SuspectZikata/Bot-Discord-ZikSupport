const { EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Lottery = require('../../models/Lottery');

module.exports = {
  name: 'configurar-loteria',
  description: '[ADMIN] Configura a loteria diária',
  type: 1,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'status',
      description: 'Ativar/desativar a loteria',
      type: 5, // Boolean
      required: false
    },
    {
      name: 'preco',
      description: 'Preço de cada bilhete',
      type: 4, // Integer
      required: false,
      min_value: 100
    },
    {
      name: 'horario',
      description: 'Horário do sorteio (HH:mm)',
      type: 3, // String
      required: false
    },
    {
      name: 'canal',
      description: 'Canal para anunciar resultados',
      type: 7, // Channel
      required: false,
      channel_types: [0] // Text channel
    }
  ],

  run: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const status = interaction.options.getBoolean('status');
    const price = interaction.options.getInteger('preco');
    const time = interaction.options.getString('horario');
    const channel = interaction.options.getChannel('canal');

    try {
      let lottery = await Lottery.findOne({ guildId: interaction.guild.id });
      if (!lottery) {
        lottery = new Lottery({ guildId: interaction.guild.id });
      }

      if (status !== null) lottery.enabled = status;
      if (price !== null) lottery.ticketPrice = price;
      if (time !== null) lottery.drawTime = time;
      if (channel !== null) lottery.channelId = channel.id;

      await lottery.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('⚙️ Configuração da Loteria')
        .addFields(
          { name: 'Status', value: lottery.enabled ? '✅ Ativa' : '❌ Inativa', inline: true },
          { name: 'Preço do bilhete', value: `${lottery.ticketPrice} estrelas`, inline: true },
          { name: 'Horário do sorteio', value: lottery.drawTime, inline: true },
          { name: 'Canal de resultados', value: lottery.channelId ? `<#${lottery.channelId}>` : 'Não definido', inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao configurar loteria:', error);
      await interaction.editReply('❌ Ocorreu um erro ao configurar a loteria!');
    }
  }
};