const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "unban", // Coloque o nome do comando
  description: "[ADMIN] Desbanir um usuário.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
        name: "user",
        description: "Mencione um usuário para ser desbanido.",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "motivo",
        description: "Insira um motivo.",
        type: Discord.ApplicationCommandOptionType.String,
        required: false,
    }
],

  run: async (client, interaction) => {

        let user = interaction.options.getUser("user");
        let motivo = interaction.options.getString("motivo");
        if (!motivo) motivo = "Não definido.";

        let embed = new Discord.EmbedBuilder()
        .setColor("Green")
        .setDescription(`O usuário ${user} (\`${user.id}\`) foi desbanido com sucesso!`);

        let erro = new Discord.EmbedBuilder()
        .setColor("Red")
        .setDescription(`Não foi possível desbanir o usuário ${user} (\`${user.id}\`) do servidor!`);

        interaction.guild.members.unban(user.id, motivo).then( () => {
            interaction.reply({ embeds: [embed] })
        }).catch(e => {
            interaction.reply({ embeds: [erro] })
        })

  }
}