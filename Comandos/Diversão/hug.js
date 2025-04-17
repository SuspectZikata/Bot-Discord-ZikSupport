const Discord = require('discord.js');

module.exports = {
    name: "hug",
    description: "Abrace um Amigo(a).",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "membro",
            description: "Mencione ele(a).",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    run: async (client, interaction) => {
        const user = interaction.options.getUser("membro");

        async function getRandomHugGif() {
            try {
                const response = await fetch(`https://g.tenor.com/v1/random?q=hug&key=LIVDSRZULELA&limit=1`);
                const data = await response.json();
                return data.results[0].media[0].gif.url;
            } catch (error) {
                console.error("Erro ao buscar GIF:", error);
                return "https://i.imgur.com/r9aU2xv.gif"; // Fallback
            }
        }

        const hugGif = await getRandomHugGif();
        const embed = new Discord.EmbedBuilder()
            .setDescription(`**${interaction.user} abraçou ${user}!** 🤗`)
            .setImage(hugGif)
            .setColor("Random");

        const button = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('retribuir')
                    .setLabel('Retribuir')
                    .setStyle(Discord.ButtonStyle.Primary)
            );

        const reply = await interaction.reply({ embeds: [embed], components: [button] });

        const filter = i => i.customId === 'retribuir' && i.user.id === user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async i => {
            const retribuirGif = await getRandomHugGif();
            const embed1 = new Discord.EmbedBuilder()
                .setDescription(`**${user} retribuiu o abraço de ${interaction.user}!** 🤗`)
                .setImage(retribuirGif)
                .setColor("Random");

            await i.reply({ embeds: [embed1] });
        });

        collector.on("end", () => {
            interaction.editReply({
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('retribuir')
                                .setLabel('Retribuir')
                                .setStyle(Discord.ButtonStyle.Primary)
                                .setDisabled(true)
                        )
                ]
            });
        });
    }
};
