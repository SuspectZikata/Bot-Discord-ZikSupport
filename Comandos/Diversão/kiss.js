const Discord = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    name: "kiss",
    description: "Beije um 'Amigo'.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "membro",
            description: "Mencione ele(a).",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    run: async (client, interaction, args) => {
        let user = interaction.options.getUser("membro");
        
        async function getRandomKissGif() {
            try {
                let response = await fetch(`https://g.tenor.com/v1/random?q=kiss&key=LIVDSRZULELA&limit=1`);
                let data = await response.json();
                return data.results[0].media[0].gif.url;
            } catch (error) {
                console.error("Erro ao buscar GIF:", error);
                return "https://imgur.com/lD2V6kG"; // Fallback
            }
        }
        
        let kissGif = await getRandomKissGif();
        let embed = new Discord.EmbedBuilder()
            .setDescription(`**${interaction.user} deu um beijo em ${user}!** 💋`)
            .setImage(kissGif)
            .setColor("Random");

        let button = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('retribuir')
                    .setLabel('Retribuir')
                    .setStyle(Discord.ButtonStyle.Primary)
            );
        
        let reply = await interaction.reply({ embeds: [embed], components: [button] });

        const filter = i => i.customId === 'retribuir' && i.user.id === user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async i => {
            let retribuirGif = await getRandomKissGif();
            let embed1 = new Discord.EmbedBuilder()
                .setDescription(`**${user} retribuiu o beijo de ${interaction.user}!** 💋`)
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
