module.exports = {
    name: 'cryptography',
    description: 'Manage cryptography challenges',
    options: [
        {
            name: 'question',
            type: 1,
            description: 'Present the current cryptography challenge',
        },
        {
            name: 'answer',
            type: 1,
            description: 'Submit an answer',
            options: [
                {
                    name: 'input',
                    type: 3,
                    description: 'Your answer',
                    required: true,
                },
            ],
        },
        {
            name: 'stats',
            type: 1,
            description: 'View your cryptography stats',
        },
    ],
    execute: async (interaction, { cryptographyManager }) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'question') {
            const userId = interaction.user.id;
            const challenge = cryptographyManager.generateRandomChallenge(userId);

            if (!challenge) {
                await interaction.reply({ content: 'Failed to generate a cryptography challenge.', ephemeral: true });
                return;
            }

            await interaction.reply({
                content: `:jigsaw: Can you decode this message?\n\`${challenge.encoded}\`\n(Submit your answer with \`/cryptography answer\`.)`,
            });
        } else if (subcommand === 'answer') {
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const input = interaction.options.getString('input');
            const challenge = cryptographyManager.getActiveChallenge(userId);

            if (!challenge) {
                await interaction.reply({ content: 'No active cryptography challenge found.', ephemeral: true });
                return;
            }

            // Normalize both the user's input and the original string to lowercase for case-insensitive comparison
            const normalizedInput = input.toLowerCase();
            const normalizedOriginal = challenge.original.toLowerCase();

            if (normalizedInput === normalizedOriginal) {
                cryptographyManager.incrementUserRecord(userId, username);
                cryptographyManager.clearActiveChallenge(userId);

                // Ephemeral response to the user
                await interaction.reply({ content: ':tada: Correct! Well done!', ephemeral: true });

                // Global announcement in the same channel
                const channel = interaction.channel; // Get the channel where the interaction occurred
                if (channel) {
                    await channel.send(`:tada: ${username} has successfully completed a cryptography challenge!`);
                }
            } else {
                await interaction.reply({ content: ':x: Incorrect, try again.', ephemeral: true });
            }
        } else if (subcommand === 'stats') {
            const userId = interaction.user.id;
            const record = cryptographyManager.getUserRecord(userId);

            await interaction.reply({
                content: `You have successfully completed ${record.successes} cryptography challenges!`,
                ephemeral: true,
            });
        }
    },
};
