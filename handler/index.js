const fs = require("fs").promises;

module.exports = async (client) => {
    const SlashsArray = [];

    // Clear previous commands in memory
    client.slashCommands.clear();

    // Load commands
    const folders = await fs.readdir("./Comandos");
    for (const subfolder of folders) {
        const files = await fs.readdir(`./Comandos/${subfolder}/`);
        for (const file of files) {
            if (!file.endsWith(".js")) continue;
            const command = require(`../Comandos/${subfolder}/${file}`);
            if (!command.name) continue;
            client.slashCommands.set(command.name, command);
            SlashsArray.push(command);
        }
    }

    // Load events
    const eventFiles = await fs.readdir("./Events");
    for (const file of eventFiles) {
        if (!file.endsWith(".js")) continue;
        const event = require(`../Events/${file}`);
        if (typeof event === "function") {
            event(client);
        }
    }

    // Register commands only once
    client.once("ready", async () => {
        
        // Choose ONE: Either global or per-guild registration
        await client.application.commands.set(SlashsArray); // Global registration

        // OR per-guild (uncomment this only if testing)
        // for (const guild of client.guilds.cache.values()) {
        //     await guild.commands.set(SlashsArray);
        // }
    });
};
