const Discord = require('discord.js');

module.exports = {
    name: "emojiinfo",
    description: "[Discord] Mostra informações detalhadas sobre um emoji",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "emoji",
            description: "Emoji para analisar",
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (client, interaction) => {
        await interaction.deferReply();

        try {
            const emojiString = interaction.options.getString('emoji');
            
            // Extrai o emoji usando expressão regular melhorada
            const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?|(\p{Emoji})/u;
            const match = emojiString.match(emojiRegex);
            
            if (!match) {
                return interaction.editReply("❌ Por favor, envie um emoji válido!");
            }

            // Verifica se é emoji customizado ou Unicode
            const isCustom = !!match[3];
            const emojiId = match[3];
            const emojiName = match[2] || match[4];
            const isAnimated = !!match[1];

            // Formatação da data para emojis customizados
            let createdAtInfo = "Emoji padrão (Unicode)";
            if (isCustom && emojiId) {
                const timestamp = Discord.SnowflakeUtil.timestampFrom(emojiId);
                const date = new Date(timestamp);
                createdAtInfo = date.toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Monta o embed
            const embed = new Discord.EmbedBuilder()
                .setTitle(`:mag_right: Informações do Emoji`)
                .setColor(isCustom ? "#5865F2" : "#57F287")
                .addFields(
                    { name: "🔖 Nome", value: `\`${emojiName}\``, inline: true },
                    { name: "💻 ID", value: isCustom ? `\`${emojiId}\`` : "`N/A`", inline: true },
                    { name: "👀 Menção", value: isCustom ? `<${isAnimated ? 'a' : ''}:${emojiName}:${emojiId}>` : `\\${emojiString}`, inline: true },
                    { name: "📅 Criado em", value: createdAtInfo, inline: true },
                    { name: "🖼️ Tipo", value: isCustom ? (isAnimated ? "`GIF Animado`" : "`Imagem`") : "`Emoji Unicode`", inline: true }
                );

            // Adiciona thumbnail para emojis customizados
            if (isCustom) {
                embed.setThumbnail(`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? "gif" : "png"}`);
            }

            // Botão para abrir imagem (só para custom)
            const row = new Discord.ActionRowBuilder();
            if (isCustom) {
                row.addComponents(
                    new Discord.ButtonBuilder()
                        .setLabel("Ver emoji no navegador.")
                        .setURL(`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? "gif" : "png"}`)
                        .setStyle(Discord.ButtonStyle.Link)
                );
            }

            await interaction.editReply({ 
                embeds: [embed], 
                components: isCustom ? [row] : [] 
            });

        } catch (error) {
            console.error("Erro no comando emojiinfo:", error);
            await interaction.editReply("❌ Ocorreu um erro ao processar o emoji. Tente novamente!");
        }
    }
};