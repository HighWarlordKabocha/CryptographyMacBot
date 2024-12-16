const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { discord } = require('./config.js');
const fs = require('fs');
const path = require('path');

// Load all command metadata from the 'commands' directory
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    const { name, description, options } = command;
    commands.push({ name, description, options: options || [] });
}

const rest = new REST({ version: '10' }).setToken(discord.token);

(async () => {
    try {
        console.log('Registering commands...');

        // Register commands for a specific guild (useful for development/testing)
        await rest.put(
            Routes.applicationGuildCommands(discord.clientId, discord.guildId),
            { body: commands }
        );

        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();
