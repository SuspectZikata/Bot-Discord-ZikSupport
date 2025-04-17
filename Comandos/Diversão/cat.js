const Discord = require('discord.js');

module.exports = {
    name: "cat",
    description: "Mostra uma imagem aleatória de gato 🐱.",
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.deferReply(); // Evita timeout se a API demorar

        async function getRandomCat() {
            try {
                const response = await fetch('https://api.thecatapi.com/v1/images/search');
                const data = await response.json();
                return data[0].url; // Retorna a URL da imagem
            } catch (error) {
                console.error("Erro ao buscar gato:", error);
                return "https://i.imgur.com/wz1JspF.jpeg"; // Fallback
            }
        }

        const catImage = await getRandomCat();
        const embed = new Discord.EmbedBuilder()
            .setDescription(`**Gatinho** 😸`)
            .setImage(catImage)
            .setColor("Random");

        await interaction.editReply({ embeds: [embed] });
    }
};
