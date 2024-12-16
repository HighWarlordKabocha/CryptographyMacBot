const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js'); // Use Routes from discord.js
const { token, ClientId, GuildId } = require('./config.js');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Fetching commands...');

        // Fetch guild-specific commands
        const guildCommands = await rest.get(Routes.applicationGuildCommands(ClientId, GuildId));
        console.log(`Found ${guildCommands.length} guild commands.`);

        // Delete guild-specific commands
        for (const command of guildCommands) {
            await rest.delete(Routes.applicationGuildCommand(ClientId, GuildId, command.id));
            console.log(`Deleted guild command: ${command.name}`);
        }

        // Fetch global commands
        const globalCommands = await rest.get(Routes.applicationCommands(ClientId));
        console.log(`Found ${globalCommands.length} global commands.`);

        // Delete global commands
        for (const command of globalCommands) {
            await rest.delete(Routes.applicationCommand(ClientId, command.id));
            console.log(`Deleted global command: ${command.name}`);
        }

        console.log('All commands deleted successfully.');
    } catch (error) {
        console.error('Error while deleting commands:', error);
    }
})();
