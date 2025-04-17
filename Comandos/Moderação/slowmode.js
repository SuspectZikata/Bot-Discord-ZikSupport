const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const ms = require("ms")

module.exports = {
  name: "slowmode",
  description: "[MOD] Configure o modo lento em um canal de texto.",
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  options: [
    {
        name: "tempo",
        description: "Coloque o tempo do modo lento [s|m|h] ou 0 para desativar.",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: "canal",
        description: "Mencione um canal de texto.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: false,
    }
  ],

  run: async (client, interaction) => {

        let t = interaction.options.getString("tempo");
        let channel = interaction.options.getChannel("canal");
        if (!channel || channel === null) channel = interaction.channel;

        // Verifica se o input é "0" para desativar o slowmode
        if (t === "0") {
            channel.setRateLimitPerUser(0).then(() => {
                interaction.reply({ content: `O modo lento foi desativado no canal ${channel}.` })
            }).catch(() => {
                interaction.reply({ content: `Ops, algo deu errado ao executar este comando, verifique minhas permissões.`, flags: MessageFlags.Ephemeral })
            })
            return;
        }

        let tempo = ms(t);

        if (!tempo || tempo === false || tempo === null) {
            interaction.reply({ content: `Forneça um tempo válido: [s|m|h] ou 0 para desativar.`, flags: MessageFlags.Ephemeral })
        } else {
            channel.setRateLimitPerUser(tempo/1000).then(() => {
                interaction.reply({ content: `O canal de texto ${channel} teve seu modo lento definido para \`${t}\`.` })
            }).catch(() => {
                interaction.reply({ content: `Ops, algo deu errado ao executar este comando, verifique minhas permissões.`, flags: MessageFlags.Ephemeral })
            })
        }
  }
}