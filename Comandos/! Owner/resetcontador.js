const fs = require("fs");
const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "resetcontador",
    description: "Reseta a contagem numérica para 0.",
    options: [],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando!`, ephemeral: true })
        } 

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
            ephemeral: true,
        });

        // Coletor de interação para a primeira confirmação
        const filtro1 = (i) => i.user.id === interaction.user.id;
        const coletor1 = mensagem1.createMessageComponentCollector({ filter: filtro1, time: 15000 });

        coletor1.on("collect", async (i) => {
            if (i.customId === "cancelar_reset") {
                return i.update({ content: "✅ O reset foi cancelado!", components: [], ephemeral: true });
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

            await i.update({
                content: "⚠️ **Última chance!** Tem certeza absoluta que deseja resetar a contagem?",
                components: [row2],
                ephemeral: true,
            });

            // Coletor para a segunda confirmação
            const coletor2 = i.message.createMessageComponentCollector({ filter: filtro1, time: 15000 });

            coletor2.on("collect", async (i2) => {
                if (i2.customId === "cancelar_reset") {
                    return i2.update({ content: "✅ O reset foi cancelado!", components: [], ephemeral: true });
                }

                // Reseta a contagem
                config.contador.ultimoNumero = 0;
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

                await i2.update({
                    content: "🔄 A contagem foi **resetada** para `0` com sucesso!",
                    components: [],
                    ephemeral: true,
                });
            });
        });
    },
};
