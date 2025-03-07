const fs = require("fs");
const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "resetcontador",
    description: "Reseta a contagem numérica para 0.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [],

    run: async (client, interaction) => {

        // Primeira confirmação
        const botaoSim1 = new Discord.ButtonBuilder()
            .setCustomId("confirmar_reset_1")
            .setLabel("Confirmar Reset")
            .setStyle(Discord.ButtonStyle.Danger);

        const botaoNao1 = new Discord.ButtonBuilder()
            .setCustomId("cancelar_reset")
            .setLabel("Cancelar")
            .setStyle(Discord.ButtonStyle.Secondary);

        const row1 = new Discord.ActionRowBuilder().addComponents(botaoSim1, botaoNao1);

        const mensagem1 = await interaction.reply({
            content: "⚠️ **Tem certeza que deseja resetar a contagem?** Esta ação é **irreversível**.",
            components: [row1],
            flags: MessageFlags.Ephemeral,
        });

        // Coletor de interação para a primeira confirmação
        const filtro1 = (i) => i.user.id === interaction.user.id;
        const coletor1 = mensagem1.createMessageComponentCollector({ filter: filtro1, time: 15000 });

        coletor1.on("collect", async (i) => {
            if (i.customId === "cancelar_reset") {
                return i.update({ content: "✅ O reset foi cancelado!", components: [], flags: MessageFlags.Ephemeral });
            }

            // Segunda confirmação
            const botaoSim2 = new Discord.ButtonBuilder()
                .setCustomId("confirmar_reset_2")
                .setLabel("Confirmar Reset Final")
                .setStyle(Discord.ButtonStyle.Danger);

            const botaoNao2 = new Discord.ButtonBuilder()
                .setCustomId("cancelar_reset")
                .setLabel("Cancelar")
                .setStyle(Discord.ButtonStyle.Secondary);

            const row2 = new Discord.ActionRowBuilder().addComponents(botaoSim2, botaoNao2);

            // Para o coletor1 antes de iniciar o coletor2
            coletor1.stop();

            await i.update({
                content: "⚠️ **Última chance!** Tem certeza absoluta que deseja resetar a contagem?",
                components: [row2],
                flags: MessageFlags.Ephemeral,
            });

            // Coletor para a segunda confirmação
            const coletor2 = i.message.createMessageComponentCollector({ 
                filter: filtro1, 
                time: 15000,
                max: 1 // Apenas uma interação
            });

            coletor2.on("collect", async (i2) => {
                try {
                    if (i2.customId === "cancelar_reset") {
                        return await i2.update({ content: "✅ O reset foi cancelado!", components: [], flags: MessageFlags.Ephemeral });
                    }

                    // Reseta a contagem
                    config.contador.ultimoNumero = 0;
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

                    await i2.update({
                        content: "🔄 A contagem foi **resetada** para `0` com sucesso!",
                        components: [],
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        // Interação expirada
                        return;
                    }
                    console.error('Erro ao processar interação:', error);
                }
            });

            coletor2.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.followUp({
                        content: '⏳ O tempo para confirmar o reset expirou.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                coletor2.stop();
            });
        });
    },
};
