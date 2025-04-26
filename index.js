const Discord = require("discord.js");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const config = require("./config.json");
const mongoose = require('mongoose');
const { connect } = require('./database');
const Giveaway = require('./models/Giveaway'); // Adicione esta linha
const { endGiveaway } = require('./utils/giveawayUtils'); // Adicione esta linha

// Função para verificar sorteios (substitui o import que estava causando erro)
async function giveawayChecker(client) {
  try {
    const activeGiveaways = await Giveaway.find({
      status: 'active',
      endTime: { $lte: new Date() }
    });

    for (const giveaway of activeGiveaways) {
      await endGiveaway(client, giveaway);
    }
  } catch (error) {
    console.error('Erro ao verificar sorteios:', error);
  }
}

async function startBot() {
  try {
    await connect();
    
    const client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [
        Discord.Partials.User,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
      ],
    });

    client.db = mongoose.connection;
    module.exports = client;

    // Evento de interação (incluindo botões de sorteio)
    client.on("interactionCreate", async (interaction) => {
      if (interaction.isCommand()) {
        // Comandos slash
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;
    
        try {
          await cmd.run(client, interaction);
        } catch (error) {
          console.error("Erro ao executar comando:", error);
          await interaction.reply({
            content: "❌ Ocorreu um erro ao executar este comando.",
            flags: MessageFlags.Ephemeral
          });
        }
      } else if (interaction.isButton()) {
        // Botões
        try {
          const giveawayManager = require('./Events/giveawayManager');
          await giveawayManager.execute(interaction);
        } catch (error) {
          console.error("Erro ao processar botão:", error);
        }
      }
    });

    // Verificar sorteios a cada minuto
    const giveawayInterval = setInterval(() => giveawayChecker(client), 60000);

    // Handlers de erro
    process.on("unhandledRejection", (error) => {
      console.error("Unhandled Rejection:", error);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
    });

    // Limpar intervalo ao desligar o bot
    process.on('SIGINT', () => {
      clearInterval(giveawayInterval);
      process.exit();
    });

    // Carregar comandos
    client.slashCommands = new Discord.Collection();
    client.slashCommands.clear?.();
    require("./handler")(client);

    // Configurações do bot
    const configbot = require("./Comandos/! Owner/configbot.js");
    configbot.handleInteractions(client);

    // Evento ready
    client.once('ready', () => {
      console.log(`🔄 Verificando sorteios a cada minuto...`);
    });

    await client.login(config.token);
    
  } catch (error) {
    console.error('Falha ao iniciar o bot:', error);
    process.exit(1);
  }
}

startBot();