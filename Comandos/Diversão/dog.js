const Discord = require('discord.js');

module.exports = {
    name: "dog",
    description: "Mostra uma imagem aleatória de cachorro 🐶.",
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.deferReply(); // Evita timeout se a API demorar

        async function getRandomDog() {
            try {
                const response = await fetch('https://dog.ceo/api/breeds/image/random');
                const data = await response.json();
                return data.message; // Retorna a URL da imagem
            } catch (error) {
                console.error("Erro ao buscar cachorro:", error);
                return "https://i.imgur.com/nbH5vRD.jpeg"; // Fallback
            }
        }

        const dogImage = await getRandomDog();
        const embed = new Discord.EmbedBuilder()
            .setDescription(`**Cachorrinho** 🐕`)
            .setImage(dogImage)
            .setColor("Random");

        await interaction.editReply({ embeds: [embed] });
    }
};
