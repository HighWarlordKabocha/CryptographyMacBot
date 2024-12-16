const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { discord } = require('./config.js');
const fs = require('fs');
const path = require('path');
const questManager = require('./questManager.js'); // Quest logic
const cryptographyManager = require('./cryptographyManager.js'); // Cryptography logic

// Initialize the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create a collection to store commands
client.commands = new Collection();

// Load commands dynamically
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Command loaded: ${command.name}`);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        // Load the active quest
        const currentQuestName = questManager.getCurrentQuest();
        if (currentQuestName) {
            const quest = questManager.loadQuest(currentQuestName);
            if (quest) {
                console.log(`Active quest loaded: "${currentQuestName}".`);
            } else {
                console.error(`Failed to load the active quest: "${currentQuestName}".`);
            }
        } else {
            console.log('No active quest is currently set.');
        }

        // Load the active cryptography challenge
        const activeCryptography = cryptographyManager.loadActiveCryptography();
        if (activeCryptography) {
            console.log(`Active cryptography challenge loaded: "${activeCryptography.wordlist}" with rule set "${activeCryptography.ruleSet}".`);
        } else {
            console.error('No active cryptography challenge is currently set.');
        }
    } catch (error) {
        console.error('An error occurred while loading the active quest or cryptography challenge:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.reply('Command not found.');
        return;
    }

    try {
        // Execute the command
        await command.execute(interaction, { questManager, cryptographyManager });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while executing that command.', ephemeral: true });
    }
});

client.login(discord.token);
