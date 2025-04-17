// Normal para todos usarem

const Discord = require("discord.js")

module.exports = {
  name: '', // Coloque o nome do comando
  description: '', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: '',
        description: '',
        type: Discord.ApplicationCommandOptionType,
        required: true,
    }
],

  run: async (client, interaction) => {
    
  }
}

//Apenas Adm

const Discord = require("discord.js");

module.exports = {
  name: '', // Coloque o nome do comando
  description: '', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [],

  run: async (client, interaction) => {

  }
}

//Apenas Dono

const Discord = require('discord.js');
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Role, Background } = require('../../models/ShopItems');

// SEU ID DO DISCORD - Substitua pelo seu ID real
const ADMIN_ID = ''; 

module.exports = {
  name: 'add-itens',
  description: '[OWNER] Adiciona itens na DataBase',
  type: Discord.ApplicationCommandType.ChatInput,
defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [],
  

  run: async (client, interaction) => {
	    // Verifica se é o administrador
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({
        content: '❌ Apenas o desenvolvedor pode usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};