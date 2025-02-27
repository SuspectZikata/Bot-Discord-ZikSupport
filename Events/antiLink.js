const Discord = require("discord.js");
const config = require("../config.json");

module.exports = async (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (!message.guild) return;
      if (message.channel.type == "dm") return;
      if (message.author.bot) return;
      
      if (!config.antiLink) {
        return;
      }
      
      if (config.antiLink) {
        if (message.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return;
        
        if (message.content.toLocaleLowerCase().includes("http")) {
          message.delete();
          message.channel.send(`${message.author} Não envie links no servidor!`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};