const dbManager = require('../databaseManager');
const fs = require('fs');
const path = require('path');

// Load activeCryptography configuration
const activeCryptography = require(path.join(__dirname, '../data/activeCryptography.json'));

// Dynamically load the ruleSet based on activeCryptography.json
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

// Dynamically require all transformer files
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

    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Ensure the user is in the users table
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
                    return interaction.reply({
                        content: 'You already have an active challenge! Solve it before requesting a new one.',
                        ephemeral: true,
                    });
                }

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
                        content: `:jigsaw: Can you decode this message?\n\`${encodedMessage}\`\n(Submit your answer with \`/cryptography answer\`.)\n**Method:** ${method}`,
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
                    const updateStats = `
                        INSERT INTO cryptographyTracker (userID, attemptCount, correctCount, streakCount, longestStreak, lastIssuedAt)
                        VALUES (?, 1, 1, 1, 1, CURRENT_TIMESTAMP)
                        ON CONFLICT(userID) DO UPDATE SET
                            attemptCount = attemptCount + 1,
                            correctCount = correctCount + 1,
                            streakCount = streakCount + 1,
                            longestStreak = CASE 
                                WHEN streakCount + 1 > longestStreak THEN streakCount + 1 
                                ELSE longestStreak 
                            END,
                            lastIssuedAt = CURRENT_TIMESTAMP;
                    `;
                    dbManager.db.run(updateStats, [userId], (err) => {
                        if (err) {
                            console.error('Error updating stats:', err.message);
                            return interaction.reply({ content: 'An error occurred while updating your stats.', ephemeral: true });
                        }

                        dbManager.db.run(`DELETE FROM cryptographyActive WHERE userID = ?`, [userId]);
                        return interaction.reply({ content: ':tada: Correct! Well done!', ephemeral: true });
                    });
                } else {
                    const resetStreak = `
                        UPDATE cryptographyTracker SET streakCount = 0 WHERE userID = ?
                    `;
                    dbManager.db.run(resetStreak, [userId], (err) => {
                        if (err) {
                            console.error('Error resetting streak:', err.message);
                            return interaction.reply({ content: 'An error occurred while resetting your streak.', ephemeral: true });
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
                SELECT attemptCount, correctCount, streakCount, longestStreak
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
                    content: `**Your Cryptography Stats:**\n
                    - Total Attempts: ${row.attemptCount}\n
                    - Correct Answers: ${row.correctCount}\n
                    - Current Streak: ${row.streakCount}\n
                    - Longest Streak: ${row.longestStreak}`,
                    ephemeral: true,
                });
            });
        }
    },
};
