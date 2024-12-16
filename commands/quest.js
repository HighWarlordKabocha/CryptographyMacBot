module.exports = {
    name: 'quest', // Command name for /quest
    description: 'Manage quests', // Description displayed in Discord
    options: [
        {
            name: 'scenario',
            type: 1, // Subcommand type (1 = subcommand)
            description: 'Present the current quest', // Description of the subcommand
        },
        {
            name: 'answer',
            type: 1, // Subcommand type
            description: 'Submit an answer', // Description of the subcommand
            options: [
                {
                    name: 'input',
                    type: 3, // Option type (3 = string)
                    description: 'Your answer', // Prompt for the user input
                    required: true, // Makes this input mandatory
                },
            ],
        },
        {
            name: 'leaderboard',
            type: 1, // Subcommand type
            description: 'Show the leaderboard', // Description of the subcommand
        },
        {
            name: 'tip',
            type: 1, // Subcommand type
            description: 'Get a hint for the current quest', // Description of the subcommand
        },
    ],
    /**
     * Executes the /quest command logic.
     * @param {Interaction} interaction - The Discord interaction object.
     * @param {Object} managers - Object containing questManager and possibly other managers.
     */
    execute: async (interaction, { questManager }) => {

        const subcommand = interaction.options.getSubcommand(); // Identify the subcommand used

        // Check if a quest is currently active
        const currentQuestName = questManager.getCurrentQuest();
        if (!currentQuestName) {
            await interaction.reply({ content: 'No quest is currently active. Please try again later.', ephemeral: true });
            return;
        }

        if (subcommand === 'scenario') {
            // Subcommand: Present the current quest scenario
            const scenario = questManager.getScenario();
            await interaction.reply({
                content: `Scenario:\n ${scenario} \n\(Submit your answer with the \`/quest answer\` command.\)`,
            });
        } else if (subcommand === 'answer') {
            // Subcommand: Validate the user's answer
            const input = interaction.options.getString('input'); // Retrieve the user's input
            const isCorrect = questManager.validateAnswer(input); // Check if the answer is correct

            if (isCorrect) {
                // Log the user in the leaderboard for the current quest
                questManager.addToLeaderboard(
                    currentQuestName,
                    interaction.user.id,
                    interaction.user.username
                );

                // Reply with success (ephemeral)
                await interaction.reply({ content: ':tada: Correct! Well done!', ephemeral: true });

                // Send a public message announcing completion
                const channel = interaction.channel;
                if (channel) {
                    await channel.send(`:tada: ${interaction.user.username} has completed the quest "${currentQuestName}"! :tada:`);
                }
            } else {
                // Reply with an incorrect answer message (ephemeral)
                await interaction.reply({ content: ':x: Incorrect, try again!', ephemeral: true });
            }
        } else if (subcommand === 'leaderboard') {
            // Subcommand: Display the leaderboard for the current quest
            const leaderboard = questManager.getQuestLeaderboard(currentQuestName);

            if (!leaderboard.users || leaderboard.users.length === 0) {
                await interaction.reply({ content: `No one has completed the current quest: ${currentQuestName}`, ephemeral: false });
            } else {
                // Format and display the leaderboard
                const leaderboardMessage = leaderboard.users
                    .map((entry, index) => `${index + 1}. ${entry.username}`)
                    .join('\n');
                await interaction.reply({ content: `Leaderboard for ${currentQuestName}:\n${leaderboardMessage}` });
            }
        } else if (subcommand === 'tip') {
            // Subcommand: Provide a hint for the current quest
            const tip = questManager.getHint();
            await interaction.reply({ content: `Hint: ${tip}`, ephemeral: true });
        }
    },
};
