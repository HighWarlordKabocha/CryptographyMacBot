const dbManager = require('../databaseManager');
const fs = require('fs');
const path = require('path');
const getStartOfDay = require('../utils/getStartOfDay'); // Utility to get the start of the day

// Load activeCryptography configuration
const activeCryptography = require(path.join(__dirname, '../data/activeCryptography.json'));

// Load the active rule set dynamically
const ruleSetPath = path.join(__dirname, `../cryptographys/ruleSets/${activeCryptography.ruleSet}.js`);
let ruleSet = {};
try {
    ruleSet = require(ruleSetPath);
    console.log(`Loaded RuleSet: ${activeCryptography.ruleSet}`);
} catch (err) {
    console.error(`Error loading ruleSet "${activeCryptography.ruleSet}":`, err.message);
    process.exit(1);
}

// Load transformers dynamically
const transformersDir = path.join(__dirname, '../cryptographys/transformers');
const transformers = {};

// Dynamically load all transformer files
fs.readdirSync(transformersDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const transformer = require(path.join(transformersDir, file));
        transformers[transformer.name] = transformer;
    }
});

// Load the wordlist dynamically
const wordListPath = path.join(__dirname, `../cryptographys/wordlists/${activeCryptography.wordlist}`);
let wordList = [];
try {
    wordList = fs.readFileSync(wordListPath, 'utf-8').split('\n').map(word => word.trim());
    console.log(`Loaded ${wordList.length} words from ${activeCryptography.wordlist}.`);
} catch (err) {
    console.error('Error loading word list:', err.message);
}

module.exports = {
    name: 'cryptography',
    description: 'Manage cryptography challenges',
    options: [
        {
            name: 'question',
            type: 1,
            description: 'Generate and present a cryptography challenge.',
        },
        {
            name: 'answer',
            type: 1,
            description: 'Submit an answer to your active cryptography challenge.',
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
            description: 'View your cryptography statistics.',
        },
    ],

    /**
     * Executes the cryptography command.
     * Handles subcommands for generating challenges, answering challenges, and viewing stats.
     * 
     * @param {Object} interaction - The interaction object representing the user's command
     */
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Ensure the user exists in the database
        dbManager.addUser(userId, username);

        // ==========================
        // /cryptography question
        // ==========================
        if (subcommand === 'question') {
            const checkActiveChallenge = `SELECT cryptographyID FROM cryptographyActive WHERE userID = ?`;
            dbManager.db.get(checkActiveChallenge, [userId], async (err, row) => {
                if (err) {
                    console.error('Error checking active challenge:', err.message);
                    return interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
                }

                if (row) {
                    // Fetch and redisplay the existing challenge
                    const fetchChallenge = `
                        SELECT encodedMessage, methodSequence
                        FROM cryptographyChallenges
                        WHERE cryptographyID = ?
                    `;
                    dbManager.db.get(fetchChallenge, [row.cryptographyID], (err, challengeRow) => {
                        if (err || !challengeRow) {
                            console.error('Error fetching active challenge details:', err?.message || 'Challenge not found.');
                            return interaction.reply({
                                content: 'You already have an active challenge, but an error occurred while retrieving it.',
                                ephemeral: true,
                            });
                        }

                        return interaction.reply({
                            content: `You already have an active challenge! Solve it before requesting a new one.\n\n**Active Challenge:**\n\`${challengeRow.encodedMessage}\``,
                            ephemeral: true,
                        });
                    });

                    return; // Stop further execution if the user already has a challenge
                }

                // Generate a new challenge
                const originalMessage = wordList[Math.floor(Math.random() * wordList.length)];

                // Filter transformers based on the active ruleSet
                const activeTransformers = Object.values(transformers).filter(t =>
                    ruleSet.activeMethods.includes(t.name)
                );

                if (activeTransformers.length === 0) {
                    console.error('No active transformers found in the ruleSet.');
                    return interaction.reply({
                        content: 'No active encoding methods are available. Please contact an administrator.',
                        ephemeral: true,
                    });
                }

                const randomTransformer = activeTransformers[Math.floor(Math.random() * activeTransformers.length)];
                const encodedMessage = randomTransformer.encode(originalMessage);
                const method = randomTransformer.name;

                const insertChallenge = `
                    INSERT INTO cryptographyChallenges (encodedMessage, originalMessage, methodSequence, createdAt)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `;
                dbManager.db.run(insertChallenge, [encodedMessage, originalMessage, method], function (err) {
                    if (err) {
                        console.error('Error inserting new challenge:', err.message);
                        return interaction.reply({ content: 'Failed to generate a challenge.', ephemeral: true });
                    }

                    const newCryptographyID = this.lastID;
                    dbManager.assignChallenge(userId, newCryptographyID);

                    return interaction.reply({
                        content: `:jigsaw: Can you decode this message?\n\`${encodedMessage}\`\n(Submit your answer with \`/cryptography answer\`.)`,
                    });
                });
            });
        }

        // ==========================
        // /cryptography answer
        // ==========================
        else if (subcommand === 'answer') {
            const userInput = interaction.options.getString('input');

            const getActiveChallenge = `
                SELECT c.originalMessage, a.cryptographyID
                FROM cryptographyActive a
                JOIN cryptographyChallenges c ON a.cryptographyID = c.cryptographyID
                WHERE a.userID = ?
            `;

            dbManager.db.get(getActiveChallenge, [userId], (err, row) => {
                if (err || !row) {
                    console.error('Error retrieving active challenge:', err?.message);
                    return interaction.reply({
                        content: 'You do not have an active challenge. Use `/cryptography question` to get one.',
                        ephemeral: true,
                    });
                }

                const isCorrect = row.originalMessage.toLowerCase() === userInput.toLowerCase();

                // Log the attempt
                dbManager.logAttempt(userId, row.cryptographyID, userInput, isCorrect);

                if (isCorrect) {
                    const today = getStartOfDay();

                    const getStreakData = `
                        SELECT lastCompletedAt, dailyStreak, longestDailyStreak
                        FROM cryptographyTracker
                        WHERE userID = ?
                    `;

                    dbManager.db.get(getStreakData, [userId], (err, streakRow) => {
                        if (err) {
                            console.error('Error fetching streak data:', err.message);
                            return interaction.reply({ content: 'An error occurred while updating your streak.', ephemeral: true });
                        }

                        const lastCompletedAt = streakRow?.lastCompletedAt ? new Date(streakRow.lastCompletedAt) : null;
                        let newDailyStreak = 1; // Default streak to 1 for first completion
                        let newLongestDailyStreak = streakRow?.longestDailyStreak || 0;

                        if (lastCompletedAt) {
                            const diffInDays = (today - lastCompletedAt) / (1000 * 60 * 60 * 24);

                            if (diffInDays === 1) {
                                newDailyStreak = streakRow.dailyStreak + 1;
                                newLongestDailyStreak = Math.max(newDailyStreak, newLongestDailyStreak);
                            } else if (diffInDays > 1) {
                                newDailyStreak = 1;
                            } else {
                                newDailyStreak = streakRow.dailyStreak;
                                newLongestDailyStreak = streakRow.longestDailyStreak;
                            }
                        }

                        const updateStreakData = `
                            INSERT INTO cryptographyTracker (userID, attemptCount, correctCount, dailyStreak, longestDailyStreak, lastCompletedAt)
                            VALUES (?, 1, 1, ?, ?, ?)
                            ON CONFLICT(userID) DO UPDATE SET
                                attemptCount = attemptCount + 1,
                                correctCount = correctCount + 1,
                                dailyStreak = ?,
                                longestDailyStreak = CASE
                                    WHEN dailyStreak > longestDailyStreak THEN dailyStreak
                                    ELSE longestDailyStreak
                                END,
                                lastCompletedAt = ?;
                        `;

                        dbManager.db.run(
                            updateStreakData,
                            [userId, newDailyStreak, newLongestDailyStreak, today, newDailyStreak, today],
                            (err) => {
                                if (err) {
                                    console.error('Error updating streak data:', err.message);
                                    return interaction.reply({ content: 'An error occurred while updating your stats.', ephemeral: true });
                                }

                                // Congratulate user for new milestones
                                if (newDailyStreak === 7) {
                                    interaction.channel.send(`🎉 Congratulations, <@${userId}>! You've completed cryptography challenges for 7 consecutive days!`);
                                }

                                dbManager.db.run(`DELETE FROM cryptographyActive WHERE userID = ?`, [userId]);
                                return interaction.reply({ content: ':tada: Correct! Well done!', ephemeral: true });
                            }
                        );
                    });
                } else {
                    const resetStreak = `
                        UPDATE cryptographyTracker SET dailyStreak = 0 WHERE userID = ?
                    `;
                    dbManager.db.run(resetStreak, [userId], (err) => {
                        if (err) {
                            console.error('Error resetting streak:', err.message);
                        }

                        return interaction.reply({ content: ':x: Incorrect answer. Try again!', ephemeral: true });
                    });
                }
            });
        }

        // ==========================
        // /cryptography stats
        // ==========================
        else if (subcommand === 'stats') {
            const queryStats = `
                SELECT attemptCount, correctCount, dailyStreak, longestDailyStreak
                FROM cryptographyTracker WHERE userID = ?
            `;
            dbManager.db.get(queryStats, [userId], (err, row) => {
                if (err || !row) {
                    console.error('Error retrieving stats:', err?.message);
                    return interaction.reply({
                        content: 'No statistics found. Solve a challenge to start tracking your stats!',
                        ephemeral: true,
                    });
                }

                return interaction.reply({
                    content: `**Your Cryptography Stats:**\n- Total Correct Answers: ${row.correctCount}\n- Current Daily Streak: ${row.dailyStreak}\n- Longest Daily Streak: ${row.longestDailyStreak}`,
                    ephemeral: true,
                });
            });
        }
    },
};
