const Discord = require('discord.js');
const { MessageFlags } = require("discord.js");
const fs = require('fs');
const path = require('path');
const { Role } = require('../../models/ShopItems');

const ADMIN_ID = '406857514639163393';
const ORDER_FILE = path.join(__dirname, '../../roleOrder.json');

function loadRoleOrder() {
  try {
    if (!fs.existsSync(ORDER_FILE)) {
      fs.writeFileSync(ORDER_FILE, JSON.stringify({ order: [] }, null, 2));
      return { order: [] };
    }
    return JSON.parse(fs.readFileSync(ORDER_FILE));
  } catch (error) {
    console.error('Erro ao carregar ordem de cargos:', error);
    return { order: [] };
  }
}

function saveRoleOrder(newOrder) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify({ order: newOrder }, null, 2));
}

module.exports = {
  name: 'ordemcargos',
  description: '[OWNER] Gerencia a ordem de exibição dos cargos no perfil',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'subcomando',
      description: 'Ação desejada',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Listar', value: 'listar' },
        { name: 'Reordenar', value: 'reordenar' }
      ]
    }
  ],
  defaultMemberPermissions: Discord.PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({
        content: '❌ Apenas o desenvolvedor pode usar este comando!',
        flags: MessageFlags.Ephemeral
      });
    }

    const subcommand = interaction.options.getString('subcomando');
    const roleOrder = loadRoleOrder();

    if (subcommand === 'listar') {
      const roles = await Role.find({});
      const orderedRoles = [];

      for (const roleId of roleOrder.order) {
        const role = roles.find(r => r._id.toString() === roleId);
        if (role) orderedRoles.push(role);
      }

      for (const role of roles) {
        if (!roleOrder.order.includes(role._id.toString())) {
          orderedRoles.push(role);
        }
      }

      const embed = new Discord.EmbedBuilder()
        .setTitle('Ordem Atual dos Cargos')
        .setColor('#7289DA')
        .setDescription(
          orderedRoles.map((role, index) => `${index + 1}. ${role.name} (ID: ${role._id})`).join('\n') || 'Nenhum cargo encontrado'
        );

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } else if (subcommand === 'reordenar') {
      const roles = await Role.find({});
      if (roles.length === 0) {
        return interaction.reply({
          content: '❌ Não há cargos cadastrados para ordenar!',
          flags: MessageFlags.Ephemeral
        });
      }

      const selectMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId('reorder_roles')
        .setPlaceholder('Selecione os cargos na nova ordem')
        .setMinValues(1)
        .setMaxValues(roles.length)
        .addOptions(roles.map(role => ({
          label: role.name,
          description: `Preço: ${role.price} estrelas`,
          value: role._id.toString()
        })));

      const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: `Selecione os cargos na ordem desejada (primeiro = topo):\n\nOrdem atual:\n${
          roleOrder.order.map((id, i) => {
            const role = roles.find(r => r._id.toString() === id);
            return role ? `${i + 1}. ${role.name}` : null;
          }).filter(Boolean).join('\n') || 'Nenhum cargo cadastrado.'
        }`,
        components: [row],
        flags: MessageFlags.Ephemeral
      });

      const filter = i => i.customId === 'reorder_roles' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        const newOrder = i.values;
        saveRoleOrder(newOrder);

        await i.update({
          content: '✅ Ordem dos cargos atualizada com sucesso!',
          components: []
        });

        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({
            content: 'Tempo esgotado para reordenar os cargos.',
            components: []
          }).catch(() => {});
        }
      });
    }
  }
};
