const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const config = require('../config.json'); // Importa o config.json

module.exports = (client) => {
  let lastConfig = { ...config }; // Cria uma cópia do config.json para comparação

  // Função para entrar no canal de voz
  const entrarNoCanal = () => {
    if (!lastConfig.autoCall) return; // Verifica se o AutoCall está ativado

    const canal = client.channels.cache.get(lastConfig.canalVozId);
    if (!canal) return console.log("❌ Canal de voz não encontrado.");
    if (canal.type !== Discord.ChannelType.GuildVoice) return console.log("❌ O canal não é de voz.");

    try {
      joinVoiceChannel({
        channelId: canal.id,
        guildId: canal.guild.id,
        adapterCreator: canal.guild.voiceAdapterCreator,
      });
      console.log(`✅ Entrei no canal de voz [ ${canal.name} ]!`);
    } catch (e) {
      console.log(`❌ Erro ao entrar no canal: ${e}`);
    }
  };

  // Monitora alterações no config.json
  fs.watchFile(path.join(__dirname, '../config.json'), (curr, prev) => {
    fs.readFile(path.join(__dirname, '../config.json'), 'utf8', (err, data) => {
      if (err) {
        console.log("❌ Erro ao ler o config.json:", err);
        return;
      }

      const newConfig = JSON.parse(data); // Lê o novo config.json

      // Verifica se houve mudança no autoCall ou canalVozId
      if (
        newConfig.autoCall !== lastConfig.autoCall ||
        newConfig.canalVozId !== lastConfig.canalVozId
      ) {
        lastConfig = { ...newConfig }; // Atualiza a cópia do config.json

        if (newConfig.autoCall) {
          entrarNoCanal(); // Entra no canal de voz se o AutoCall estiver ativado
        } else {
          console.log("❌ AutoCall desativado. Não entrando no canal de voz.");
        }
      }
    });
  });

  // Entra no canal de voz quando o bot é iniciado (se o AutoCall estiver ativado)
  client.on("ready", () => {
    if (lastConfig.autoCall) {
      entrarNoCanal();
    }
  });
};