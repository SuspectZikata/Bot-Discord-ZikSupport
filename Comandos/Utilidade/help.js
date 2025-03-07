const Discord = require("discord.js")

module.exports = {
  name: "help",
  description: "Mostra o painel de ajuda.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    let embed_painel = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Olá ${interaction.user}, seja bem-vindo(a) ao painel de ajuda!\n\nEscolha uma categoria no menu abaixo para ver os comandos disponíveis.`)
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_utilidade = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Utilidade", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de utilidade disponíveis:")
      .addFields([
        { name: "🤖 `/botinfo`", value: "Mostra informações sobre o bot." },
        { name: "❓ `/help`", value: "Mostra o painel de ajuda." },
        { name: "🏓 `/ping`", value: "Mostra o ping do bot." },
        { name: "📊 `/serverinfo`", value: "Mostra informações sobre o servidor." },
        { name: "👤 `/userinfo`", value: "Mostra informações sobre um usuário." }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_diversao = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Diversão", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de diversão disponíveis:")
      .addFields([
        { name: "🤗 `/hug`", value: "Abraça um usuário." },
        { name: "😘 `/kiss`", value: "Beija um usuário." },
        { name: "👋 `/slap`", value: "Dá um tapa em um usuário." }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_adm = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Administração", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de administração disponíveis:")
      .addFields([
        { name: "🔗 `/antilink`", value: "Remove mensagens com links." },
        { name: "📢 `/anunciar`", value: "Envia um anúncio em um canal específico." },
        { name: "🔨 `/ban`", value: "Bane um usuário do servidor." },
        { name: "📋 `/cargo_botao`", value: "Adiciona/remova cargos via botão." },
        { name: "🧹 `/clear`", value: "Limpa mensagens no canal." },
        { name: "📨 `/dm`", value: "Envia uma mensagem privada para um usuário." },
        { name: "👢 `/kick`", value: "Expulsa um usuário do servidor." },
        { name: "🔒 `/lock`", value: "Tranca um canal." },
        { name: "🗣️ `/say`", value: "Faz o bot dizer uma mensagem." },
        { name: "✏️ `/setnick`", value: "Define um apelido para um usuário." },
        { name: "🐢 `/slowmode`", value: "Define o modo lento em um canal." },
        { name: "🎉 `/sorteio`", value: "Realiza um sorteio." },
        { name: "📝 `/transcript`", value: "Gera um transcript de um canal." },
        { name: "🔓 `/unban`", value: "Remove o ban de um usuário." },
        { name: "🔓 `/unlock`", value: "Destranca um canal." },
        { name: "💡 `/sugerir`", value: "Envia uma sugestão." },
        { name: "✅ `/verificação`", value: "Configura a verificação de membros." }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const painel = new Discord.ActionRowBuilder().addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId("painel_help")
        .setPlaceholder("Selecione uma categoria")
        .addOptions([
          {
            label: "Início",
            description: "Voltar ao painel inicial",
            emoji: "🏠",
            value: "painel"
          },
          {
            label: "Utilidade",
            description: "Comandos de utilidade",
            emoji: "🛠️",
            value: "utilidade"
          },
          {
            label: "Diversão",
            description: "Comandos de diversão",
            emoji: "🎮",
            value: "diversao"
          },
          {
            label: "Administração",
            description: "Comandos de administração",
            emoji: "⚡",
            value: "adm"
          }
        ])
    );

    const message = await interaction.reply({ 
      embeds: [embed_painel], 
      components: [painel], 
      flags: MessageFlags.Ephemeral 
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: Discord.ComponentType.SelectMenu,
      time: 120000 // 2 minutos
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ 
          content: "Você não pode interagir com este menu!", 
          flags: MessageFlags.Ephemeral 
        });
      }

      const value = i.values[0];

      if (value === "adm" && !interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        return i.reply({ 
          content: "Você precisa ser administrador para ver os comandos de administração!", 
          flags: MessageFlags.Ephemeral 
        });
      }

      const embeds = {
        painel: embed_painel,
        utilidade: embed_utilidade,
        diversao: embed_diversao,
        adm: embed_adm
      };

      await i.deferUpdate();
      await interaction.editReply({
        embeds: [embeds[value]],
        components: [painel]
      });
    });

    collector.on("end", async () => {
      // Remove o menu após 2 minutos
      const disabledPanel = new Discord.ActionRowBuilder().addComponents(
        painel.components[0].setDisabled(true)
      );

      await interaction.editReply({
        components: [disabledPanel]
      });
    });
  }
}