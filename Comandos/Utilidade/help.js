const Discord = require("discord.js");
const { MessageFlags } = require('discord.js');

module.exports = {
  name: "help",
  description: "Mostra o painel de ajuda.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const isOwner = interaction.user.id === "406857514639163393";
    const isAdmin = interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator);

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
        { name: "👤 `/userinfo`", value: "Mostra informações sobre um usuário." },
        { name: "ℹ️ `/emoji-info`", value: "Mostra informações detalhadas sobre um emoji" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_diversao = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Diversão", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de diversão disponíveis:")
      .addFields([
        { name: "🐱 `/cat`", value: "Mostra uma imagem aleatória de gato." },
        { name: "🐶 `/dog`", value: "Mostra uma imagem aleatória de cachorro." },
        { name: "🤗 `/hug`", value: "Abraça um usuário." },
        { name: "😘 `/kiss`", value: "Beija um usuário." },
        { name: "👋 `/slap`", value: "Dá um tapa em um usuário." }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_economia = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Economia", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de economia disponíveis:")
      .addFields([
        { name: "⭐ `/daily`", value: "Receba suas estrelas diárias!" },
        { name: "🛒 `/loja`", value: "Navegue pelos planos de fundo disponíveis na loja" },
        { name: "🏆 `/ranking`", value: "Mostra o ranking dos usuários com mais estrelas." },
        { name: "💰 `/saldo`", value: "Veja seu saldo atual de estrelas" },
        { name: "💸 `/transferir`", value: "Transfira estrelas para outro usuário sem taxas" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_perfil = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Perfil", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de perfil disponíveis:")
      .addFields([
        { name: "🎒 `/inventario`", value: "Veja seus planos de fundo adquiridos" },
        { name: "👤 `/perfil`", value: "Mostra seu perfil personalizado com seus cargos e conquistas" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_formularios = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Formulários", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de formulários disponíveis:")
      .addFields([
        { name: "⚙️ `/formconfig`", value: "Configura um novo formulário ou edita um existente" },
        { name: "📋 `/formpanel`", value: "Cria um painel para um formulário" },
        { name: "❓ `/formquestions`", value: "Gerencia as perguntas de um formulário" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_moderacao = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Moderação", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de moderação disponíveis:")
      .addFields([
        { name: "🧹 `/clear`", value: "Limpa mensagens no canal." },
        { name: "📨 `/dm`", value: "Envia uma mensagem privada para um usuário." },
        { name: "🗑️ `/dmclear`", value: "Apaga todas as mensagens enviadas pelo bot para um usuário" },
        { name: "👢 `/kick`", value: "Expulsa um usuário do servidor." },
        { name: "🔒 `/lock`", value: "Tranca um canal." },
        { name: "✏️ `/setnick`", value: "Define um apelido para um usuário." },
        { name: "🐢 `/slowmode`", value: "Define o modo lento em um canal." },
        { name: "🔓 `/unlock`", value: "Destranca um canal." }
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
        { name: "📝 `/boasvindas-config`", value: "Configure as mensagens de boas-vindas do servidor" },
        { name: "🔢 `/contador`", value: "Configura o contador do servidor" },
        { name: "📊 `/embed`", value: "Cria uma embed personalizada (Em desenvolvimento)" },
        { name: "📦 `/itens`", value: "Lista todos os itens disponíveis" },
        { name: "🔄 `/resetcontador`", value: "Reseta a contagem numérica para 0." },
        { name: "🗣️ `/say`", value: "Faz o bot dizer uma mensagem." },
        { name: "⚙️ `/setstatus`", value: "Altera o status do bot" },
        { name: "💡 `/sugerir`", value: "Configura mensagem de sugestão." },
        { name: "📝 `/transcript`", value: "Gera um transcript de um canal." },
        { name: "🔓 `/unban`", value: "Remove o ban de um usuário." },
        { name: "✅ `/verificação`", value: "Configura a verificação de membros." }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_dono = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos Exclusivos do Dono", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos exclusivos do dono:")
      .addFields([
        { name: "➕ `/add-itens`", value: "Adiciona itens na DataBase (Cargo e Plano de Fundo)" },
        { name: "⚙️ `/configbot`", value: "Configure as opções do bot" },
        { name: "🎁 `/dar item`", value: "Adiciona um item diretamente a um usuário" },
        { name: "🛒 `/gerenciar-loja`", value: "Gerencia planos de fundo na loja." },
        { name: "🔢 `/ordemcargos`", value: "Gerencia a ordem de exibição dos cargos no perfil" },
        { name: "➖ `/rem-itens`", value: "Remove itens da DataBase" },
        { name: "❌ `/remover-item`", value: "Remove um item do inventário de um usuário." },
        { name: "🔄 `/resetcontador`", value: "Reseta contadores específicos" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    let embed_sorteios = new Discord.EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({ name: "Comandos de Sorteios", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Lista de todos os comandos de sorteios disponíveis:")
      .addFields([
        { name: "⏩ `/sorteio-adiantar`", value: "Finaliza um sorteio antecipadamente" },
        { name: "❌ `/sorteio-cancelar`", value: "Cancela um sorteio e exclui permanentemente" },
        { name: "📝 `/sorteio-criar`", value: "Cria um novo sorteio (não publica)" },
        { name: "📤 `/sorteio-enviar`", value: "Publica um sorteio criado" },
        { name: "📋 `/sorteio-listar`", value: "Lista todos os sorteios pendentes" }
      ])
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const options = [
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
        label: "Economia",
        description: "Comandos de economia",
        emoji: "💰",
        value: "economia"
      },
      {
        label: "Perfil",
        description: "Comandos de perfil",
        emoji: "👤",
        value: "perfil"
      },
      {
        label: "Formulários",
        description: "Comandos de formulários",
        emoji: "📋",
        value: "formularios"
      },
      {
        label: "Moderação",
        description: "Comandos de moderação",
        emoji: "🛡️",
        value: "moderacao"
      },
      {
        label: "Administração",
        description: "Comandos de administração",
        emoji: "⚡",
        value: "adm"
      },
      {
        label: "Sorteios",
        description: "Comandos de sorteios",
        emoji: "🎉",
        value: "sorteios"
      }
    ];

    // Adiciona opção de dono apenas se o usuário for o dono
    if (isOwner) {
      options.push({
        label: "Dono",
        description: "Comandos exclusivos do dono",
        emoji: "👑",
        value: "dono"
      });
    }

    const painel = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder() // Substituído por StringSelectMenuBuilder
        .setCustomId("painel_help")
        .setPlaceholder("Selecione uma categoria")
        .addOptions(options)
    );

    const message = await interaction.reply({ 
      embeds: [embed_painel], 
      components: [painel], 
      flags: MessageFlags.Ephemeral 
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: Discord.ComponentType.StringSelect,
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

      if (value === "adm" && !isAdmin) {
        return i.reply({ 
          content: "Você precisa ser administrador para ver os comandos de administração!", 
          flags: MessageFlags.Ephemeral 
        });
      }

      if (value === "dono" && !isOwner) {
        return i.reply({ 
          content: "Este menu é exclusivo para o dono do bot!", 
          flags: MessageFlags.Ephemeral 
        });
      }

      const embeds = {
        painel: embed_painel,
        utilidade: embed_utilidade,
        diversao: embed_diversao,
        economia: embed_economia,
        perfil: embed_perfil,
        formularios: embed_formularios,
        moderacao: embed_moderacao,
        adm: embed_adm,
        dono: embed_dono,
        sorteios: embed_sorteios
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
      }).catch(() => {});
    });
  }
};