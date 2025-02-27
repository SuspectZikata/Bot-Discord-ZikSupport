require('../index');

const Discord = require('discord.js');
const client = require('../index');
const fs = require('fs');
const path = require('path');

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "verificar") {
            // Carregar o config.json
            const configPath = path.join(__dirname, "../config.json");
            let config = require(configPath);

            let role_id = config.verificationRoleId;
            let role = interaction.guild.roles.cache.get(role_id);
            if (!role) return;

            interaction.member.roles.add(role.id);
            interaction.reply({ content: `Olá **${interaction.user.username}**, você foi verificado!`, ephemeral: true });
        }
    }
});