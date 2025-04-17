const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "testarboasvindas",
  description: "[ADMIN] Testa a mensagem de boas-vindas do servidor",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "membro",
      description: "Membro para simular a entrada (opcional)",
      type: Discord.ApplicationCommandOptionType.User,
      required: false
    }
  ],
  run: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // Obtém o membro alvo ou usa quem executou o comando
      const member = interaction.options.getMember("membro") || interaction.member;

      // Dispara manualmente o evento de boas-vindas
      client.emit('guildMemberAdd', member);

      await interaction.editReply({
        content: "✅ Mensagem de boas-vindas disparada com sucesso!",
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('Erro no comando de teste:', error);
      await interaction.editReply({
        content: "❌ Ocorreu um erro ao testar as boas-vindas. Verifique o console.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
};