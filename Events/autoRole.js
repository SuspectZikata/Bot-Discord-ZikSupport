const client = require('../index');
const config = require('../config.json');

client.on("guildMemberAdd", async (member) => {
    // Verifica se o AutoRole está ativado
    if (!config.autoRole) return;

    // Verifica se existe um cargo configurado
    if (!config.autoRoleId) {
        console.log("❌ O AutoRole está ativado mas nenhum cargo foi configurado.");
        return;
    }

    // Tenta obter o cargo
    const cargo = member.guild.roles.cache.get(config.autoRoleId);
    if (!cargo) {
        console.log(`❌ O cargo configurado para o AutoRole (ID: ${config.autoRoleId}) não foi encontrado.`);
        return;
    }

    try {
        // Adiciona o cargo ao membro
        await member.roles.add(cargo);
        console.log(`✅ Cargo ${cargo.name} adicionado automaticamente ao usuário ${member.user.tag}`);
    } catch (error) {
        console.log(`❌ Não foi possível adicionar o cargo ${cargo.name} ao usuário ${member.user.tag}`);
        console.error(error);
    }
});