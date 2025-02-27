const fs = require("fs");
const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "configbot",
    description: "Configure as opções do bot.",
    options: [],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: `Você não possui permissão para utilizar este comando!`, ephemeral: true })
            } 

        const botaoCanais = new Discord.ButtonBuilder()
            .setCustomId("config_canais")
            .setLabel("Canais")
            .setStyle(Discord.ButtonStyle.Primary);
        
        const botaoEventos = new Discord.ButtonBuilder()
            .setCustomId("config_eventos")
            .setLabel("Eventos")
            .setStyle(Discord.ButtonStyle.Primary);

        const botaoGeral = new Discord.ButtonBuilder()
            .setCustomId("config_geral")
            .setLabel("Geral")
            .setStyle(Discord.ButtonStyle.Primary);

        const row = new Discord.ActionRowBuilder().addComponents(botaoCanais, botaoEventos, botaoGeral);

        const embed = new Discord.EmbedBuilder()
            .setColor("Blue")
            .setTitle("Configuração do Bot")
            .setDescription("Selecione uma categoria de configuração abaixo.");

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};

module.exports.handleInteractions = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        // Menu Geral
        if (interaction.customId === "config_geral") {
            const botaoAntiLink = new Discord.ButtonBuilder()
                .setCustomId("config_antilink")
                .setLabel(config.antiLink ? "Desativar AntiLink" : "Ativar AntiLink")
                .setStyle(config.antiLink ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Success);

            const botaoAutoRole = new Discord.ButtonBuilder()
                .setCustomId("config_autorole")
                .setLabel("AutoRole")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(botaoAntiLink, botaoAutoRole, botaoVoltar);

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Configurações Gerais")
                .setDescription(`**AntiLink:** ${config.antiLink ? "Ativado" : "Desativado"}`);

            await interaction.update({ embeds: [embed], components: [row] });
        }

        // Menu de configuração de canais
        if (interaction.customId === "config_canais") {
            const botaoCanalSugestao = new Discord.ButtonBuilder()
                .setCustomId("config_canal_sugestao")
                .setLabel("Alterar Canal de Sugestões")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoCanaisComando = new Discord.ButtonBuilder()
                .setCustomId("config_canais_comando")
                .setLabel("Canais de Comando")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoCanaisImagem = new Discord.ButtonBuilder()
                .setCustomId("config_canais_imagem")
                .setLabel("Canais de Imagem")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(
                botaoCanalSugestao,                
                botaoCanaisComando,
                botaoCanaisImagem,
                botaoVoltar
            );

            const canalSugestao = interaction.guild.channels.cache.get(config.canalSugestao);
            const canalSugestaoTexto = canalSugestao ? `\n\nCanal de Sugestões: <#${config.canalSugestao}>` : '\n\nCanal de Sugestões: Não configurado';

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Configuração de Canais")
                .setDescription(`Clique em um botão abaixo para modificar uma configuração específica.${canalSugestaoTexto}`);

            await interaction.update({ embeds: [embed], components: [row] });
        }

        // Menu de configuração de eventos
        if (interaction.customId === "config_eventos") {
            const botaoAutoCall = new Discord.ButtonBuilder()
                .setCustomId("config_auto_call")
                .setLabel("Configurar AutoCall")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(botaoAutoCall, botaoVoltar);

            const embed = new Discord.EmbedBuilder()
                .setColor("Orange")
                .setTitle("Configuração de Eventos")
                .setDescription("Clique no botão abaixo para configurar o AutoCall.");

            await interaction.update({ embeds: [embed], components: [row] });
        }

        // Configurar AntiLink
        if (interaction.customId === "config_antilink") {
            config.antiLink = !config.antiLink;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            const botaoAntiLink = new Discord.ButtonBuilder()
                .setCustomId("config_antilink")
                .setLabel(config.antiLink ? "Desativar AntiLink" : "Ativar AntiLink")
                .setStyle(config.antiLink ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Success);

            const botaoAutoRole = new Discord.ButtonBuilder()
                .setCustomId("config_autorole")
                .setLabel("AutoRole")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(botaoAntiLink, botaoAutoRole, botaoVoltar);

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Configurações Gerais")
                .setDescription(`**AntiLink:** ${config.antiLink ? "Ativado" : "Desativado"}`);

            await interaction.update({ embeds: [embed], components: [row] });
            await interaction.followUp({ 
                content: `O AntiLink foi ${config.antiLink ? "ativado" : "desativado"}!`, 
                ephemeral: true 
            });
        }

        // Configuração do Canal de Sugestões
        if (interaction.customId === "config_canal_sugestao") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_canal_sugestao")
                .setTitle("Configurar Canal de Sugestões");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_canal_sugestao")
                .setLabel("Digite o ID do canal de sugestões")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
                .setValue(config.canalSugestao || '');

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Lidar com o modal do canal de sugestões
        if (interaction.isModalSubmit() && interaction.customId === "modal_canal_sugestao") {
            await interaction.deferUpdate();

            const novoCanalId = interaction.fields.getTextInputValue("novo_canal_sugestao");

            // Verifica se o ID é válido
            const canal = interaction.guild.channels.cache.get(novoCanalId);
            if (!canal) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um canal válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Atualiza o canal de sugestões no config
            config.canalSugestao = novoCanalId;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            await interaction.followUp({ 
                content: `✅ Canal de sugestões atualizado para ${canal.name}!`, 
                ephemeral: true 
            });
        }

        // Configuração do Canal de Voz Principal
        if (interaction.customId === "config_canal_voz") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_canal_voz_principal")
                .setTitle("Configurar Canal de Voz Principal");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_canal_voz_principal")
                .setLabel("Digite o ID do canal de voz principal")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
                .setValue(config.canalVozPrincipal || '');

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Lidar com o modal do canal de voz principal
        if (interaction.isModalSubmit() && interaction.customId === "modal_canal_voz_principal") {
            await interaction.deferUpdate();

            const novoCanalId = interaction.fields.getTextInputValue("novo_canal_voz_principal");

            // Verifica se o ID é válido
            const canal = interaction.guild.channels.cache.get(novoCanalId);
            if (!canal || canal.type !== Discord.ChannelType.GuildVoice) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um canal de voz válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Atualiza o canal de voz principal no config
            config.canalVozPrincipal = novoCanalId;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            await interaction.followUp({ 
                content: `✅ Canal de voz principal atualizado para ${canal.name}!`, 
                ephemeral: true 
            });
        }

        // Menu de configuração de canais de comando
        if (interaction.customId === "config_canais_comando") {
            await updateCanaisComandoMenu(interaction);
        }

        // Menu de configuração de canais de imagem
        if (interaction.customId === "config_canais_imagem") {
            await updateCanaisImagemMenu(interaction);
        }

        // Adicionar canal de comando
        if (interaction.customId === "adicionar_canal_comando") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_adicionar_canal_comando")
                .setTitle("Adicionar Canal de Comando");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_canal_comando")
                .setLabel("Digite o ID do canal")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Remover canal de comando
        if (interaction.customId === "remover_canal_comando") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_remover_canal_comando")
                .setTitle("Remover Canal de Comando");

            const input = new Discord.TextInputBuilder()
                .setCustomId("remover_canal_comando_id")
                .setLabel("Digite o ID do canal para remover")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Adicionar canal de imagem
        if (interaction.customId === "adicionar_canal_imagem") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_adicionar_canal_imagem")
                .setTitle("Adicionar Canal de Imagem");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_canal_imagem")
                .setLabel("Digite o ID do canal")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Remover canal de imagem
        if (interaction.customId === "remover_canal_imagem") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_remover_canal_imagem")
                .setTitle("Remover Canal de Imagem");

            const input = new Discord.TextInputBuilder()
                .setCustomId("remover_canal_imagem_id")
                .setLabel("Digite o ID do canal para remover")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Lidar com o modal de adicionar canal de comando
        if (interaction.isModalSubmit() && interaction.customId === "modal_adicionar_canal_comando") {
            await interaction.deferUpdate();

            const novoCanalId = interaction.fields.getTextInputValue("novo_canal_comando");

            // Verifica se o ID é válido
            const canal = interaction.guild.channels.cache.get(novoCanalId);
            if (!canal) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um canal válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Inicializa o array se não existir
            if (!config.blockmessage) {
                config.blockmessage = [];
            }

            // Verifica se o canal já está na lista
            if (config.blockmessage.includes(novoCanalId)) {
                await interaction.followUp({ 
                    content: "❌ Este canal já está configurado como canal de comando.", 
                    ephemeral: true 
                });
                return;
            }

            // Adiciona o canal à lista
            config.blockmessage.push(novoCanalId);
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateCanaisComandoMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O canal ${canal.name} foi adicionado aos canais de comando!`, 
                ephemeral: true 
            });
        }

        // Lidar com o modal de remover canal de comando
        if (interaction.isModalSubmit() && interaction.customId === "modal_remover_canal_comando") {
            await interaction.deferUpdate();

            const canalId = interaction.fields.getTextInputValue("remover_canal_comando_id");

            // Verifica se o canal está na lista
            if (!config.blockmessage || !config.blockmessage.includes(canalId)) {
                await interaction.followUp({ 
                    content: "❌ Este canal não está configurado como canal de comando.", 
                    ephemeral: true 
                });
                return;
            }

            // Remove o canal da lista
            config.blockmessage = config.blockmessage.filter(id => id !== canalId);
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateCanaisComandoMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O canal foi removido dos canais de comando!`, 
                ephemeral: true 
            });
        }

        // Lidar com o modal de adicionar canal de imagem
        if (interaction.isModalSubmit() && interaction.customId === "modal_adicionar_canal_imagem") {
            await interaction.deferUpdate();

            const novoCanalId = interaction.fields.getTextInputValue("novo_canal_imagem");

            // Verifica se o ID é válido
            const canal = interaction.guild.channels.cache.get(novoCanalId);
            if (!canal) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um canal válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Inicializa o array se não existir
            if (!config.imageOnlyChannels) {
                config.imageOnlyChannels = [];
            }

            // Verifica se o canal já está na lista
            if (config.imageOnlyChannels.includes(novoCanalId)) {
                await interaction.followUp({ 
                    content: "❌ Este canal já está configurado como canal de imagem.", 
                    ephemeral: true 
                });
                return;
            }

            // Adiciona o canal à lista
            config.imageOnlyChannels.push(novoCanalId);
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateCanaisImagemMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O canal ${canal.name} foi adicionado aos canais de imagem!`, 
                ephemeral: true 
            });
        }

        // Lidar com o modal de remover canal de imagem
        if (interaction.isModalSubmit() && interaction.customId === "modal_remover_canal_imagem") {
            await interaction.deferUpdate();

            const canalId = interaction.fields.getTextInputValue("remover_canal_imagem_id");

            // Verifica se o canal está na lista
            if (!config.imageOnlyChannels || !config.imageOnlyChannels.includes(canalId)) {
                await interaction.followUp({ 
                    content: "❌ Este canal não está configurado como canal de imagem.", 
                    ephemeral: true 
                });
                return;
            }

            // Remove o canal da lista
            config.imageOnlyChannels = config.imageOnlyChannels.filter(id => id !== canalId);
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateCanaisImagemMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O canal foi removido dos canais de imagem!`, 
                ephemeral: true 
            });
        }

        // Menu de configuração do AutoRole
        if (interaction.customId === "config_autorole") {
            await updateAutoRoleMenu(interaction);
        }

        // Menu de configuração do AutoCall
        if (interaction.customId === "config_auto_call") {
            await updateAutoCallMenu(interaction);
        }

        // Ativar/Desativar AutoRole
        if (interaction.customId === "ativar_autorole") {
            config.autoRole = !config.autoRole;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
            
            await updateAutoRoleMenu(interaction);
            await interaction.followUp({ 
                content: `O AutoRole foi **${config.autoRole ? "ativado" : "desativado"}**!`, 
                ephemeral: true 
            });
        }

        // Modificar o cargo do AutoRole
        if (interaction.customId === "modificar_cargo_autorole") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_modificar_cargo_autorole")
                .setTitle("Modificar Cargo do AutoRole");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_cargo_autorole")
                .setLabel("Digite o ID do cargo para o AutoRole")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
                .setValue(config.autoRoleId || '');

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Lidar com o modal de modificação do cargo do AutoRole
        if (interaction.isModalSubmit() && interaction.customId === "modal_modificar_cargo_autorole") {
            await interaction.deferUpdate();

            const novoCargoId = interaction.fields.getTextInputValue("novo_cargo_autorole");

            // Verifica se o ID é válido
            const cargo = interaction.guild.roles.cache.get(novoCargoId);
            if (!cargo) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um cargo válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Atualiza o ID do cargo no config.json
            config.autoRoleId = novoCargoId;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateAutoRoleMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O cargo do AutoRole foi atualizado para ${cargo.name}!`, 
                ephemeral: true 
            });
        }

        // Ativar/Desativar AutoCall
        if (interaction.customId === "ativar_auto_call") {
            config.autoCall = !config.autoCall;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
            
            await updateAutoCallMenu(interaction);
            await interaction.followUp({ 
                content: `O AutoCall foi **${config.autoCall ? "ativado" : "desativado"}**!`, 
                ephemeral: true 
            });
        }

        // Modificar o canal de voz do AutoCall
        if (interaction.customId === "modificar_canal_voz") {
            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_modificar_canal_voz")
                .setTitle("Modificar Canal de Voz");

            const input = new Discord.TextInputBuilder()
                .setCustomId("novo_canal_voz")
                .setLabel("Digite o ID do novo canal de voz")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
                .setValue(config.canalVozId || '');

            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Lidar com o modal de modificação do canal de voz
        if (interaction.isModalSubmit() && interaction.customId === "modal_modificar_canal_voz") {
            await interaction.deferUpdate();

            const novoCanalVozId = interaction.fields.getTextInputValue("novo_canal_voz");

            // Verifica se o ID é válido
            const canal = interaction.guild.channels.cache.get(novoCanalVozId);
            if (!canal || canal.type !== Discord.ChannelType.GuildVoice) {
                await interaction.followUp({ 
                    content: "❌ O ID fornecido não é um canal de voz válido.", 
                    ephemeral: true 
                });
                return;
            }

            // Atualiza o ID do canal de voz no config.json
            config.canalVozId = novoCanalVozId;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

            // Atualiza o menu e envia confirmação
            await updateAutoCallMenu(interaction);
            await interaction.followUp({ 
                content: `✅ O canal de voz foi atualizado para ${canal.name}!`, 
                ephemeral: true 
            });
        }

        // Botão de voltar para o menu principal
        if (interaction.customId === "voltar_menu_principal") {
            const botaoCanais = new Discord.ButtonBuilder()
                .setCustomId("config_canais")
                .setLabel("Canais")
                .setStyle(Discord.ButtonStyle.Primary);
            
            const botaoEventos = new Discord.ButtonBuilder()
                .setCustomId("config_eventos")
                .setLabel("Eventos")
                .setStyle(Discord.ButtonStyle.Primary);

            const botaoGeral = new Discord.ButtonBuilder()
                .setCustomId("config_geral")
                .setLabel("Geral")
                .setStyle(Discord.ButtonStyle.Primary);

            const row = new Discord.ActionRowBuilder().addComponents(botaoCanais, botaoEventos, botaoGeral);

            const embed = new Discord.EmbedBuilder()
                .setColor("Blue")
                .setTitle("Configuração do Bot")
                .setDescription("Selecione uma categoria de configuração abaixo.");

            await interaction.update({ embeds: [embed], components: [row] });
        }

        // Botão de voltar para o menu de canais
        if (interaction.customId === "voltar_menu_canais") {
            const botaoCanalSugestao = new Discord.ButtonBuilder()
                .setCustomId("config_canal_sugestao")
                .setLabel("Alterar Canal de Sugestões")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoCanaisComando = new Discord.ButtonBuilder()
                .setCustomId("config_canais_comando")
                .setLabel("Canais de Comando")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoCanaisImagem = new Discord.ButtonBuilder()
                .setCustomId("config_canais_imagem")
                .setLabel("Canais de Imagem")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(
                botaoCanalSugestao, 
                botaoCanaisComando,
                botaoCanaisImagem,
                botaoVoltar
            );

            const canalSugestao = interaction.guild.channels.cache.get(config.canalSugestao);
            const canalSugestaoTexto = canalSugestao ? `\n\nCanal de Sugestões: <#${config.canalSugestao}>` : '\n\nCanal de Sugestões: Não configurado';

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Configuração de Canais")
                .setDescription(`Clique em um botão abaixo para modificar uma configuração específica.${canalSugestaoTexto}`);

            await interaction.update({ embeds: [embed], components: [row] });
        }

        // Botão de voltar para o menu de eventos
        if (interaction.customId === "voltar_menu_eventos") {
            const botaoAutoCall = new Discord.ButtonBuilder()
                .setCustomId("config_auto_call")
                .setLabel("Configurar AutoCall")
                .setStyle(Discord.ButtonStyle.Secondary);

            const botaoVoltar = new Discord.ButtonBuilder()
                .setCustomId("voltar_menu_principal")
                .setLabel("Voltar")
                .setStyle(Discord.ButtonStyle.Danger);

            const row = new Discord.ActionRowBuilder().addComponents(botaoAutoCall, botaoVoltar);

            const embed = new Discord.EmbedBuilder()
                .setColor("Orange")
                .setTitle("Configuração de Eventos")
                .setDescription("Clique no botão abaixo para configurar o AutoCall.");

            await interaction.update({ embeds: [embed], components: [row] });
        }
    });
};

// Função auxiliar para atualizar o menu de canais de comando
async function updateCanaisComandoMenu(interaction) {
    const botaoAdicionar = new Discord.ButtonBuilder()
        .setCustomId("adicionar_canal_comando")
        .setLabel("Adicionar Canal")
        .setStyle(Discord.ButtonStyle.Success);

    const botaoRemover = new Discord.ButtonBuilder()
        .setCustomId("remover_canal_comando")
        .setLabel("Remover Canal")
        .setStyle(Discord.ButtonStyle.Danger);

    const botaoVoltar = new Discord.ButtonBuilder()
        .setCustomId("voltar_menu_canais")
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Secondary);

    const row = new Discord.ActionRowBuilder().addComponents(botaoAdicionar, botaoRemover, botaoVoltar);

    let canaisConfigurados = "Nenhum canal configurado";
    if (config.blockmessage && config.blockmessage.length > 0) {
        canaisConfigurados = config.blockmessage
            .map(id => {
                const canal = interaction.guild.channels.cache.get(id);
                return canal ? `<#${id}>` : `ID: ${id} (Canal não encontrado)`;
            })
            .join("\n");
    }

    const embed = new Discord.EmbedBuilder()
        .setColor("Blue")
        .setTitle("Configuração de Canais de Comando")
        .setDescription("Gerencie os canais que aceitam apenas comandos.\n\n**Canais Configurados:**\n" + canaisConfigurados);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.update({ embeds: [embed], components: [row] });
    }
}

// Função auxiliar para atualizar o menu de canais de imagem
async function updateCanaisImagemMenu(interaction) {
    const botaoAdicionar = new Discord.ButtonBuilder()
        .setCustomId("adicionar_canal_imagem")
        .setLabel("Adicionar Canal")
        .setStyle(Discord.ButtonStyle.Success);

    const botaoRemover = new Discord.ButtonBuilder()
        .setCustomId("remover_canal_imagem")
        .setLabel("Remover Canal")
        .setStyle(Discord.ButtonStyle.Danger);

    const botaoVoltar = new Discord.ButtonBuilder()
        .setCustomId("voltar_menu_canais")
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Secondary);

    const row = new Discord.ActionRowBuilder().addComponents(botaoAdicionar, botaoRemover, botaoVoltar);

    let canaisConfigurados = "Nenhum canal configurado";
    if (config.imageOnlyChannels && config.imageOnlyChannels.length > 0) {
        canaisConfigurados = config.imageOnlyChannels
            .map(id => {
                const canal = interaction.guild.channels.cache.get(id);
                return canal ? `<#${id}>` : `ID: ${id} (Canal não encontrado)`;
            })
            .join("\n");
    }

    const embed = new Discord.EmbedBuilder()
        .setColor("Purple")
        .setTitle("Configuração de Canais de Imagem")
        .setDescription("Gerencie os canais que aceitam apenas imagens.\n\n**Canais Configurados:**\n" + canaisConfigurados);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.update({ embeds: [embed], components: [row] });
    }
}

// Função auxiliar para atualizar o menu do AutoRole
async function updateAutoRoleMenu(interaction) {
    const botaoAtivarAutoRole = new Discord.ButtonBuilder()
        .setCustomId("ativar_autorole")
        .setLabel(config.autoRole ? "Desativar AutoRole" : "Ativar AutoRole")
        .setStyle(config.autoRole ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Success);

    const botaoModificarCargo = new Discord.ButtonBuilder()
        .setCustomId("modificar_cargo_autorole")
        .setLabel("Modificar Cargo")
        .setStyle(Discord.ButtonStyle.Secondary);

    const botaoVoltar = new Discord.ButtonBuilder()
        .setCustomId("voltar_menu_principal")
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Danger);

    const row = new Discord.ActionRowBuilder().addComponents(botaoAtivarAutoRole, botaoModificarCargo, botaoVoltar);

    const cargo = interaction.guild.roles.cache.get(config.autoRoleId);
    const cargoNome = cargo ? cargo.name : "Não configurado";

    const embed = new Discord.EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Configuração do AutoRole")
        .setDescription(`Status atual: **${config.autoRole ? "Ativado" : "Desativado"}**\nCargo atual: ${cargo ? cargo.name : "Não configurado"}`);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.update({ embeds: [embed], components: [row] });
    }
}

// Função auxiliar para atualizar o menu do AutoCall
async function updateAutoCallMenu(interaction) {
    const botaoAtivarAutoCall = new Discord.ButtonBuilder()
        .setCustomId("ativar_auto_call")
        .setLabel(config.autoCall ? "Desativar AutoCall" : "Ativar AutoCall")
        .setStyle(config.autoCall ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Success);

    const botaoModificarCanalVoz = new Discord.ButtonBuilder()
        .setCustomId("modificar_canal_voz")
        .setLabel("Modificar Canal de Voz")
        .setStyle(Discord.ButtonStyle.Secondary);

    const botaoVoltar = new Discord.ButtonBuilder()
        .setCustomId("voltar_menu_eventos")
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Danger);

    const row = new Discord.ActionRowBuilder().addComponents(botaoAtivarAutoCall, botaoModificarCanalVoz, botaoVoltar);

    const embed = new Discord.EmbedBuilder()
        .setColor("Purple")
        .setTitle("Configuração do AutoCall")
        .setDescription(`Status atual: **${config.autoCall ? "Ativado" : "Desativado"}**\nCanal de voz atual: ${config.canalVozId ? `<#${config.canalVozId}>` : "Não configurado"}`);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.update({ embeds: [embed], components: [row] });
    }
}