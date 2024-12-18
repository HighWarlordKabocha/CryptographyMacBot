const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { discord } = require('./config');
const { token, clientId: ClientId, guildId: GuildId } = discord;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

// Load all command files dynamically
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command && command.name && command.description) {
        commands.push({
            name: command.name,
            description: command.description,
            options: command.options || [],
        });
    } else {
        console.warn(`Command file "${file}" is missing required fields.`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registering commands...');
        await rest.put(
            Routes.applicationGuildCommands(ClientId, GuildId),
            { body: commands }
        );
        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();
