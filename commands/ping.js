// Defunct (not currently implemented)
module.exports = {
    name: 'ping', // Command name
    description: 'Replies with Pong!', // Command description
    execute: async (interaction) => {
        await interaction.reply('Pong!');
    },
};
