const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Carregar configuração
const config = require('./config.json');
const { token, clientId, guildId } = config;

// Verificar se as informações necessárias estão presentes
if (!token || !clientId || !guildId) {
  console.error('Erro: token, clientId ou guildId não configurados no arquivo config.json');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Carregar comandos
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`Comando carregado para deploy: ${command.data.name}`);
  } else {
    console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" obrigatória.`);
  }
}

// Configurar REST API
const rest = new REST({ version: '10' }).setToken(token);

// Função para registrar comandos
(async () => {
  try {
    console.log(`Iniciando o registro de ${commands.length} comandos...`);
    
    // Registrar comandos no servidor específico (mais rápido para desenvolvimento)
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    
    console.log(`Sucesso! ${data.length} comandos registrados.`);
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
})();