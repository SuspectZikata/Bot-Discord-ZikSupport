const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "unlock", // Coloque o nome do comando
  description: "[MOD] Desbloqueie um canal.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  options: [
    {
        name: "canal",
        description: "Mencione um canal para o desbloquear o chat.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    }
],

  run: async (client, interaction) => {

        const canal = interaction.options.getChannel("canal")

        const permissaoAtual = canal.permissionOverwrites.cache.get(interaction.guild.id)?.deny.has(PermissionFlagsBits.SendMessages);
        
        if (!permissaoAtual) {
            await interaction.reply({ 
                content: `🔓 O canal ${canal} já está desbloqueado!`
            })
            
            const msg1 = await interaction.fetchReply();

            setTimeout(() => msg1.delete().catch(() => {}), 5 * 60 * 1000)
            return;
        }

        canal.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true }).then( async () => {
            await interaction.reply({ 
                content: `🔓 O canal de texto ${canal} foi desbloqueado!`
            })
            setTimeout(() => msg1.delete().catch(() => {}), 5 * 60 * 1000)

            const msg1 = await interaction.fetchReply();
            
            if (canal.id !== interaction.channel.id) {
                const msg2 = await canal.send({ content: `🔓 Este canal foi desbloqueado!` })
                setTimeout(() => msg2.delete().catch(() => {}), 5 * 60 * 1000)
            }
        }).catch(e => {
            interaction.reply({ content: `❌ Ops, algo deu errado.` })
        })
    
  }
}
