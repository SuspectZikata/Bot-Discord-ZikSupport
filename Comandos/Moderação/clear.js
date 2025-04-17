const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "clear", // Coloque o nome do comando
  description: "[MOD] Limpe o canal de texto", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  options: [
    {
      name: 'quantidade',
      description: 'Número de mensagens para serem apagadas.',
      type: Discord.ApplicationCommandOptionType.Number,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    let numero = interaction.options.getNumber('quantidade');

    if (parseInt(numero) > 99 || parseInt(numero) <= 0) {
      let embed = new Discord.EmbedBuilder()
        .setColor("Random")
        .setDescription(`\`/clear [1 - 99]\``);

      return interaction.reply({ embeds: [embed] });
    } 

    try {
      await interaction.channel.bulkDelete(parseInt(numero), true);
      
      let embed = new Discord.EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setDescription(`O canal de texto ${interaction.channel} teve \`${numero}\` mensagens deletadas por \`${interaction.user.username}\`.`);

      await interaction.reply({ embeds: [embed] });

      let apagar_mensagem = "sim"; // sim ou nao

      if (apagar_mensagem === "sim") {
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (error) {
            console.error('Erro ao deletar a resposta:', error);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao tentar deletar mensagens:', error);

      let embed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setDescription(`Ocorreu um erro ao tentar deletar as mensagens. Por favor, tente novamente.`);

      interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  }
};
