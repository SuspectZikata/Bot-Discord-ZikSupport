const Discord = require('discord.js');
const client = require('../index');
const config = require('../config.json');
const updateBotStatus = require('../Comandos/! Owner/setstatus').updateBotStatus;

client.on('ready', async () => {
    console.log(`🔥 Estou online em ${client.user.username}!`);

    try {
        // Verifica se existe configuração de status
        if (config.status) {
            // Aguarda um momento para garantir que o bot está totalmente pronto
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Usa a função updateBotStatus do comando setstatus
            const success = await updateBotStatus(client, config.status);
            
            if (success) {
                console.log('✅ Status carregado com sucesso:', {
                    status: config.status.status,
                    description: config.status.description,
                    type: config.status.activityType
                });
            } else {
                console.error('❌ Erro ao carregar o status do bot');
            }
        } else {
            // Define um status padrão caso não haja configuração
            const defaultStatus = {
                status: 'online',
                description: 'Estou online!',
                activityType: 0
            };
            
            await updateBotStatus(client, defaultStatus);
            console.log('ℹ️ Status padrão definido');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar status do bot:', error);
    }
});