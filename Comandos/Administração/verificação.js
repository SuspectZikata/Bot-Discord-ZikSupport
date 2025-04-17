const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "verificação", // Coloque o nome do comando
  description: "[ADMIN] Ative o sistema de verificação.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
        name: "cargo_verificado",
        description: "Mencione um cargo para o membro receber após se verificar.",
        type: Discord.ApplicationCommandOptionType.Role,
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

        let canal = interaction.options.getChannel("canal");
        if (!canal) canal = interaction.channel;

        let cargo = interaction.options.getRole("cargo_verificado");

        // Carregar o config.json
        const configPath = path.join(__dirname, "../../config.json");
        let config = require(configPath);

        // Atualizar o cargo de verificação no config.json
        config.verificationRoleId = cargo.id;

        // Salvar as alterações no config.json
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        let embed_ephemeral = new Discord.EmbedBuilder()
            .setColor("Grey")
            .setDescription(`Olá ${interaction.user}, o sistema foi ativado no canal ${canal} com sucesso.`);

        let embed_verificacao = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(`> Clique no botão abaixo para se verificar no servidor.`);

        let botao = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("verificar")
                .setEmoji("✅")
                .setLabel("Verifique-se")
                .setStyle(Discord.ButtonStyle.Primary)
        );

        interaction.reply({ embeds: [embed_ephemeral], flags: MessageFlags.Ephemeral }).then(() => {
            canal.send({ embeds: [embed_verificacao], components: [botao] });
        });
  }
}