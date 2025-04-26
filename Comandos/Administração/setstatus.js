const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags, ActivityType } = require("discord.js");
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

// Status options with emojis and descriptions
const STATUS_OPTIONS = [
    { emoji: "🟢", name: "online", label: "Online", description: "Mostra que o bot está online e ativo" },
    { emoji: "🔴", name: "dnd", label: "Não Perturbe", description: "Mostra que o bot está ocupado" },
    { emoji: "🟡", name: "idle", label: "Ausente", description: "Mostra que o bot está ausente" },
    { emoji: "⚫", name: "invisible", label: "Invisível", description: "Oculta o status do bot" }
];

// Activity type options
const ACTIVITY_TYPES = [
    { name: ActivityType.Playing, label: "Jogando" },
    { name: ActivityType.Listening, label: "Ouvindo" },
    { name: ActivityType.Watching, label: "Assistindo" },
    { name: ActivityType.Competing, label: "Competindo em" }
];

// Função para atualizar o status do bot
async function updateBotStatus(client, statusConfig) {
    try {
        await client.user.setPresence({
            status: statusConfig.status,
            activities: [{
                name: statusConfig.description || 'Nenhuma descrição',
                type: statusConfig.activityType
            }]
        });

        // Salva no config.json para persistência
        config.status = { ...statusConfig };
        fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2));
        
        return true;
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return false;
    }
}

module.exports = {
    updateBotStatus,
    name: "setstatus",
    description: "[ADMIN] Configure o status do bot.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [],

    run: async (client, interaction) => {
        // Carrega o status atual do config ou usa valores padrão
        let newStatus = {
            status: config.status?.status || 'online',
            activityType: config.status?.activityType || ActivityType.Playing,
            description: config.status?.description || ''
        };

        // Função para criar os componentes da mensagem
        function createComponents() {
            const statusMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('status_select')
                .setPlaceholder('Selecione o status')
                .addOptions(
                    STATUS_OPTIONS.map(status => ({
                        label: status.label,
                        description: status.description,
                        value: status.name,
                        emoji: status.emoji,
                        default: status.name === newStatus.status
                    }))
                );

            const activityTypeMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('activity_type_select')
                .setPlaceholder('Selecione o tipo de atividade')
                .addOptions(
                    ACTIVITY_TYPES.map(type => ({
                        label: type.label,
                        value: type.name.toString(),
                        default: type.name === newStatus.activityType
                    }))
                );

            const editDescriptionButton = new Discord.ButtonBuilder()
                .setCustomId('edit_description')
                .setLabel('Editar Descrição')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji('📝');

            const saveButton = new Discord.ButtonBuilder()
                .setCustomId('save_status')
                .setLabel('Salvar Configuração')
                .setStyle(Discord.ButtonStyle.Success)
                .setEmoji('💾');

            const statusRow = new Discord.ActionRowBuilder().addComponents(statusMenu);
            const activityTypeRow = new Discord.ActionRowBuilder().addComponents(activityTypeMenu);
            const buttonRow = new Discord.ActionRowBuilder().addComponents(editDescriptionButton, saveButton);

            return [statusRow, activityTypeRow, buttonRow];
        }

        // Função para criar o embed da mensagem
        function createEmbed() {
            return new Discord.EmbedBuilder()
                .setColor("Blue")
                .setTitle("🔧 Configuração de Status")
                .setDescription("Configure o status do bot usando as opções abaixo.")
                .addFields(
                    { 
                        name: "Status Atual", 
                        value: `${STATUS_OPTIONS.find(s => s.name === newStatus.status)?.emoji || '🟢'} ${newStatus.status}`
                    },
                    { 
                        name: "Tipo de Atividade", 
                        value: ACTIVITY_TYPES.find(t => t.name === newStatus.activityType)?.label || 'Jogando'
                    },
                    { 
                        name: "Descrição", 
                        value: newStatus.description || 'Nenhuma descrição definida'
                    }
                );
        }

        // Envia a mensagem inicial
        await interaction.reply({ 
            embeds: [createEmbed()], 
            components: createComponents(),
            flags: MessageFlags.Ephemeral
        });

        const message = await interaction.fetchReply();

        // Cria um coletor para os componentes da mensagem
        const componentCollector = message.createMessageComponentCollector({ 
            time: 300000 // 5 minutos
        });

        // Cria um coletor para os modais (com o mesmo tempo de vida)
        const modalCollector = message.createModalSubmitCollector({
            time: 300000
        });

        // Manipulador de eventos para componentes
        componentCollector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                await i.reply({ 
                    content: 'Você não pode usar estes controles.', 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            try {
                if (i.customId === 'status_select') {
                    newStatus.status = i.values[0];
                    await updateBotStatus(client, newStatus);
                    await i.update({ 
                        embeds: [createEmbed()], 
                        components: createComponents() 
                    });
                }
                else if (i.customId === 'activity_type_select') {
                    newStatus.activityType = parseInt(i.values[0]);
                    await updateBotStatus(client, newStatus);
                    await i.update({ 
                        embeds: [createEmbed()], 
                        components: createComponents() 
                    });
                }
                else if (i.customId === 'edit_description') {
                    const modal = new Discord.ModalBuilder()
                        .setCustomId('description_modal')
                        .setTitle('Editar Descrição');

                    const descriptionInput = new Discord.TextInputBuilder()
                        .setCustomId('description_input')
                        .setLabel('Nova descrição')
                        .setStyle(Discord.TextInputStyle.Short)
                        .setMaxLength(128)
                        .setValue(newStatus.description || '')
                        .setRequired(true);

                    const actionRow = new Discord.ActionRowBuilder().addComponents(descriptionInput);
                    modal.addComponents(actionRow);

                    await i.showModal(modal);
                }
                else if (i.customId === 'save_status') {
                    await i.deferUpdate();
                    await updateBotStatus(client, newStatus);
                    
                    await i.editReply({ 
                        embeds: [createEmbed()], 
                        components: createComponents() 
                    });
                    
                    await i.followUp({ 
                        content: '✅ Configuração salva com sucesso!', 
                        flags: MessageFlags.Ephemeral 
                    });
                }
            } catch (error) {
                console.error('Erro ao processar interação:', error);
                await i.followUp({
                    content: '❌ Ocorreu um erro ao processar sua solicitação.',
                    flags: MessageFlags.Ephemeral
                }).catch(console.error);
            }
        });

        // Manipulador de eventos para modais
        modalCollector.on('collect', async modalInteraction => {
            try {
                await modalInteraction.deferUpdate();
                newStatus.description = modalInteraction.fields.getTextInputValue('description_input');
                await updateBotStatus(client, newStatus);
                
                await modalInteraction.editReply({
                    embeds: [createEmbed()],
                    components: createComponents()
                });
            } catch (error) {
                console.error('Erro ao processar modal:', error);
                await modalInteraction.followUp({
                    content: '❌ Ocorreu um erro ao atualizar a descrição.',
                    flags: MessageFlags.Ephemeral
                }).catch(console.error);
            }
        });

        // Quando o coletor terminar
        componentCollector.on('end', () => {
            try {
                // Remove os componentes da mensagem
                interaction.editReply({ 
                    components: [] 
                }).catch(() => {});
                
                // Para o coletor de modais
                modalCollector.stop();
            } catch (error) {
                console.error('Erro ao finalizar coletor:', error);
            }
        });
    }
};