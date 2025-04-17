const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "lock", // Coloque o nome do comando
  description: "[MOD] Bloqueie um canal.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  options: [
    {
        name: "canal",
        description: "Mencione um canal para o bloquear o chat.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    }
],

  run: async (client, interaction) => {

        const canal = interaction.options.getChannel("canal")

        const permissaoAtual = canal.permissionOverwrites.cache.get(interaction.guild.id)?.deny.has(PermissionFlagsBits.SendMessages);
        
        if (permissaoAtual) {
            await interaction.reply({ 
                content: `🔒 O canal ${canal} já está bloqueado!`
            })

            const msg1 = await interaction.fetchReply();

            setTimeout(() => msg1.delete().catch(() => {}), 5 * 60 * 1000)
            return;
        }

        canal.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }).then( async () => {
            await interaction.reply({ 
                content: `🔒 O canal de texto ${canal} foi bloqueado!`
            })

            const msg1 = await interaction.fetchReply();

            setTimeout(() => msg1.delete().catch(() => {}), 5 * 60 * 1000)
            
            if (canal.id !== interaction.channel.id) {
                const msg2 = await canal.send({ content: `🔒 Este canal foi bloqueado!` })
                setTimeout(() => msg2.delete().catch(() => {}), 5 * 60 * 1000)
            }
              
        }).catch(e => {
            interaction.reply({ content: `❌ Ops, algo deu errado.` })
        })
    
  }
}
