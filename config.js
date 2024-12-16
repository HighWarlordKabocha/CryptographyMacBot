require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.BOT_TOKEN,       // The bot's token, used to authenticate with Discord's API
        clientId: process.env.CLIENT_ID,    // The application (bot) client ID, retrieved from Discord Developer Portal
        guildId: process.env.GUILD_ID       // The guild (server) ID for guild-specific slash commands
    }
};