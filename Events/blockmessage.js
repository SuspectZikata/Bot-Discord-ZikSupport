const client = require('../index');
const config = require('../config.json');

client.on('messageCreate', async (message) => {
    // Ignorar mensagens do bot
    if (message.author.bot) return;

    // Verificar se a mensagem está em um canal apenas para comandos
    if (config.blockmessage && config.blockmessage.includes(message.channel.id)) {
        // Verificar se a mensagem começa com um prefixo de comando (por exemplo, '/')
        if (!message.content.startsWith('/')) {
            try {
                // Apagar a mensagem original com tratamento de erro específico
                try {
                    await message.delete();
                } catch (err) {
                    if (err.code !== 10008) {
                    }
                }

                // Enviar uma mensagem de alerta que será apagada após alguns segundos
                const warningMessage = await message.channel.send({
                    content: `${message.author}, este canal é apenas para comandos. Por favor, use comandos iniciados com '/'.`,
                });

                // Apagar a mensagem de alerta após 5 segundos (5000 ms)
                setTimeout(async () => {
                    try {
                        await warningMessage.delete();
                    } catch (error) {
                        console.error('Erro ao apagar a mensagem de alerta:', error);
                    }
                }, 5000);
            } catch (error) {
                console.error('Erro ao processar a mensagem:', error);
            }
        }
    }

    // Verificar se a mensagem está em um canal apenas para imagens
    if (config.imageOnlyChannels && config.imageOnlyChannels.includes(message.channel.id)) {
        // Verificar se a mensagem contém pelo menos um anexo
        if (message.attachments.size === 0) {
            try {
                // Apagar a mensagem original com tratamento de erro específico
                try {
                    await message.delete();
                } catch (err) {
                    if (err.code !== 10008) {
                        console.error('Erro ao deletar a mensagem:', err);
                    }
                }

                // Enviar uma mensagem de alerta que será apagada após alguns segundos
                const warningMessage = await message.channel.send({
                    content: `${message.author}, este canal é apenas para o envio de imagens.`,
                });

                // Apagar a mensagem de alerta após 5 segundos (5000 ms)
                setTimeout(async () => {
                    try {
                        await warningMessage.delete();
                    } catch (error) {
                        console.error('Erro ao apagar a mensagem de alerta:', error);
                    }
                }, 5000);
            } catch (error) {
                console.error('Erro ao processar a mensagem:', error);
            }
        }
    }
});
