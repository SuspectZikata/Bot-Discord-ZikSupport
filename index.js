const Discord = require("discord.js");
const config = require("./config.json");

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

module.exports = client;

client.on("interactionCreate", (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply("Error");
    interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
    cmd.run(client, interaction);
  }
});

// Anti Crash
process.on("unhandledRejection", (reason, promise) => {
  console.log(reason + promise);
});
process.on("uncaughtException", (error, origin) => {
  console.log(error + origin);
});
process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.log(error + origin);
});

client.slashCommands = new Discord.Collection();

require("./handler")(client);

// Carrega o configbot.js e registra os eventos de interação
const configbot = require("./Comandos/! Owner/configbot.js");
configbot.handleInteractions(client);

client.login(config.token);