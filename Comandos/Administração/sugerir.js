const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Carregar configurações do arquivo JSON
const configPath = path.resolve(__dirname, "../../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

module.exports = {
    name: "sugerir",
    description: "Mensagem de sugestão.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [],

    run: async (client, interaction, args) => {

        const botaoPublico = new Discord.ButtonBuilder()
            .setCustomId('sugerir_botao')
            .setLabel('Fazer uma sugestão')
            .setStyle(Discord.ButtonStyle.Primary);

        const botaoAnonimo = new Discord.ButtonBuilder()
            .setCustomId('sugerir_anonimo_botao')
            .setLabel('Fazer uma sugestão anônima')
            .setStyle(Discord.ButtonStyle.Secondary);

        const row = new Discord.ActionRowBuilder().addComponents(botaoPublico, botaoAnonimo);

        const embed = new Discord.EmbedBuilder()
        .setColor('Blue')
        .setTitle('💡 Sugestões Abertas!')
        .setDescription('Tem uma ideia incrível? Quer compartilhar algo que pode melhorar nosso servidor? 🔥\n\nClique em um dos botões abaixo e faça a sua sugestão agora! 🚀');


        await interaction.reply({ embeds: [embed], components: [row] });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton() && (interaction.customId === 'sugerir_botao' || interaction.customId === 'sugerir_anonimo_botao')) {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(interaction.customId === 'sugerir_botao' ? 'sugerir_modal' : 'sugerir_modal_anonimo')
                    .setTitle('Nova Sugestão');

                const input = new Discord.TextInputBuilder()
                    .setCustomId('sugestao_input')
                    .setLabel('Digite sua sugestão')
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true);

                const actionRow = new Discord.ActionRowBuilder().addComponents(input);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
            }

            if (interaction.isModalSubmit() && (interaction.customId === 'sugerir_modal' || interaction.customId === 'sugerir_modal_anonimo')) {
                const sugestao = interaction.fields.getTextInputValue('sugestao_input');
                const canalSugestao = client.channels.cache.get(config.canalSugestao);

                if (!canalSugestao) {
                    return interaction.reply({ content: "Canal de sugestões não encontrado!", flags: MessageFlags.Ephemeral });
                }

                const embed = new Discord.EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Nova Sugestão!')
                    .setDescription(`**Sugestão:**\n${sugestao}`)
                    .setTimestamp();

                if (interaction.customId === 'sugerir_modal') {
                    embed.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                } else {
                    embed.setFooter({ text: "Sugestão anônima" });
                }

                canalSugestao.send({ embeds: [embed] }).then(async (message) => {
                    await message.react('👍');
                    await message.react('👎');
                });

                await interaction.reply({ content: "Sua sugestão foi enviada com sucesso!", flags: MessageFlags.Ephemeral });
            }
        });
    }
};
