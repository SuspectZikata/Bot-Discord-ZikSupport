const fs = require("fs");
const config = require("../config.json");

module.exports = (client) => {
    client.on("messageCreate", async (message) => {
        // Verifica se a mensagem foi enviada no canal de contagem e se o autor não é um bot
        if (!config.contador?.canalId || message.channel.id !== config.contador.canalId || message.author.bot) return;

        const numeroAtual = parseInt(message.content);

        // Se a mensagem não for um número, apaga
        if (isNaN(numeroAtual)) {
            await message.delete();
            return;
        }

        // Verifica se o número é o próximo na sequência
        const proximoNumero = config.contador.ultimoNumero + 1;
        if (numeroAtual !== proximoNumero) {
            await message.delete(); // Apenas apaga a mensagem errada, sem responder
            return;
        }

        // Atualiza o último número no config.json
        config.contador.ultimoNumero = numeroAtual;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        // Adiciona uma reação de confirmação
        await message.react("✅");
    });
};
