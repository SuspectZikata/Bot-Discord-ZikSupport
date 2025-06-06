const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "setnick", // Coloque o nome do comando
  description: "[MOD] Configura o nickname do usuário no servidor.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.ManageNicknames,
  options: [
    {
      name: "membro",
      description: "Mencione um membro para alterar o nick.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "nick",
      description: "Escreva o novo nickname do membro.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    }
  ],

  run: async (client, interaction) => {

      const user = interaction.options.getUser("membro");
      const membro = interaction.guild.members.cache.get(user.id);
      const nick = interaction.options.getString("nick");

      if (nick.length > 32) {
        let embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setDescription(`O nick digitado possui mais de 32 caracteres.`);
        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
      }

      membro.setNickname(nick)
        .then(() => {
          let embed = new Discord.EmbedBuilder()
            .setColor("Green")
            .setDescription(`O usuário ${user} teve seu nickname alterado para \`${nick}\` com sucesso.`);
          interaction.reply({ embeds: [embed] });
        })
        .catch(e => {
          let embed = new Discord.EmbedBuilder()
            .setColor("Red")
            .setDescription(`Ocorreu um erro ao tentar alterar o nickname. Verifique se eu tenho as permissões necessárias e se o membro não tem um cargo superior ao meu.`);
          interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        });
  }
};
