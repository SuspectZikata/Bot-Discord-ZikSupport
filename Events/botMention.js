require('../index');

const Discord = require('discord.js');
const { MessageFlags } = require('discord.js');
const client = require('../index');

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    let mencoes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];

    mencoes.forEach(async (element) => {
        if (message.content === element) {
            let embed = new Discord.EmbedBuilder()
                .setColor("#3498db") // Cor personalizada
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`🎉 **Olá, ${message.author}!**\n\n👋 Seja bem-vindo(a)!\n\n🌟 Use \`/help\` para explorar meus comandos e aprender o que eu posso fazer para ajudar você.\n\n🔗 **Links Úteis:**\n\n- 🌐 [GitHub](https://github.com/SuspectZikata)\n- 💬 [Discord](http://discord.com/invite/RDVQSJUvxb)\n\n✨ Divirta-se e aproveite ao máximo!`)
                .setFooter({
                    text: "© 2025 SuspectZikata • Todos os direitos reservados • ✨",
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                });

            // Responde com a mensagem em ephemeral
            await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

            // Deleta a menção após 10 segundos
            setTimeout(() => {
                message.delete().catch(console.error);
            }, 10000);
        }
    });
});
