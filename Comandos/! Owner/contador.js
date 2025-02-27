const fs = require("fs");
const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "contador",
    description: "Configura o canal de contagem numérica.",
    options: [
        {
            name: "canal",
            description: "Escolha o canal de texto para o contador.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando!`, ephemeral: true })
        } 

        const canal = interaction.options.getChannel("canal");

        // Verifica se o canal é de texto
        if (canal.type !== Discord.ChannelType.GuildText) {
            return interaction.reply({
                content: "❌ O canal selecionado não é um canal de texto!",
                ephemeral: true,
            });
        }

        // Salva o canal no config.json
        config.contador = {
            canalId: canal.id,
            ultimoNumero: 0, // Inicia a contagem do zero
        };
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        await interaction.reply({
            content: `✅ Canal de contagem configurado para ${canal.name}!`,
            ephemeral: true,
        });
    },
};

// Função para verificar as mensagens no canal de contagem
module.exports.verificarContagem = (client) => {
    client.on("messageCreate", async (message) => {
        // Verifica se a mensagem foi enviada no canal de contagem
        if (message.channel.id !== config.contador?.canalId || message.author.bot) return;

        const numeroAtual = parseInt(message.content);

        // Verifica se a mensagem é um número
        if (isNaN(numeroAtual)) {
            await message.delete(); // Apaga a mensagem se não for um número
            return;
        }

        // Verifica se o número é o próximo na sequência
        const proximoNumero = config.contador.ultimoNumero + 1;
        if (numeroAtual !== proximoNumero) {
            await message.reply({
                content: `❌ Erro! O próximo número era **${proximoNumero}**.`,
            });
            await message.delete(); // Apaga a mensagem incorreta
            return;
        }

        // Atualiza o último número na configuração
        config.contador.ultimoNumero = numeroAtual;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        // Adiciona uma reação de confirmação
        await message.react("✅");
    });
};