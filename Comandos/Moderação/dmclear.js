const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const client = require("../../index");

module.exports = {
  name: "dmclear",
  description: "[MOD] Apaga todas as mensagens enviadas pelo bot para um usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  options: [
    {
      name: "usuário",
      description: "Mencione o usuário para limpar as mensagens",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("usuário");
    
    try {
      // Buscar o canal de DM com o usuário
      const dmChannel = await user.createDM();
      
      // Responder imediatamente para evitar timeout
      await interaction.reply({ 
        content: '⏳ Processando...', 
        flags: MessageFlags.Ephemeral,
      });
      
      // Buscar todas as mensagens enviadas pelo bot
      const messages = await dmChannel.messages.fetch({ limit: 100 });
      const botMessages = messages.filter(msg => msg.author.id === client.user.id);
      
      // Apagar as mensagens uma por uma
      let deletedCount = 0;
      for (const message of botMessages.values()) {
        try {
          await message.delete();
          deletedCount++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay para evitar rate limits
        } catch (error) {
          console.error(`Erro ao apagar mensagem ${message.id}:`, error);
        }
      }
      
      const embed = new Discord.EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ ${deletedCount} mensagens do bot para ${user} foram apagadas com sucesso!`);
        
      await interaction.editReply({ 
        content: '', 
        embeds: [embed] 
      });
      
    } catch (error) {
      console.error(error);
      const embed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setDescription(`❌ Erro ao tentar apagar mensagens para ${user}`);
        
      await interaction.editReply({ 
        content: '', 
        embeds: [embed] 
      });
    }
  },
};
