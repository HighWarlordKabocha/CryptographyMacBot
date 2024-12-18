const sqlite3 = require('sqlite3').verbose();

// Initialize database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

/**
 * Adds a user to the database.
 * If the user already exists, no changes are made.
 * 
 * @param {string} userID - The Discord user ID
 * @param {string} username - The username of the user
 */
function addUser(userID, username) {
    const query = `INSERT OR IGNORE INTO users (userID, username) VALUES (?, ?)`;
    db.run(query, [userID, username], (err) => {
        if (err) {
            console.error('Error adding user:', err.message);
        } else {
            console.log(`User ${userID} added or already exists.`);
        }
    });
}

/**
 * Assigns an active challenge to a user.
 * Replaces any existing active challenge for the user.
 * 
 * @param {string} userID - The Discord user ID
 * @param {number} cryptographyID - The ID of the cryptography challenge
 */
function assignChallenge(userID, cryptographyID) {
    const query = `
        INSERT OR REPLACE INTO cryptographyActive (userID, cryptographyID, assignedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    db.run(query, [userID, cryptographyID], (err) => {
        if (err) {
            console.error('Error assigning challenge:', err.message);
        } else {
            console.log(`Challenge ${cryptographyID} assigned to user ${userID}.`);
        }
    });
}

/**
 * Logs a user's attempt at a cryptography challenge.
 * 
 * @param {string} userID - The Discord user ID
 * @param {number} cryptographyID - The ID of the cryptography challenge
 * @param {string} userAnswer - The answer provided by the user
 * @param {boolean} isCorrect - Whether the user's answer was correct
 */
function logAttempt(userID, cryptographyID, userAnswer, isCorrect) {
    const query = `
        INSERT INTO cryptographyAttempts (userID, cryptographyID, userAnswer, isCorrect)
        VALUES (?, ?, ?, ?)
    `;
    db.run(query, [userID, cryptographyID, userAnswer, isCorrect], (err) => {
        if (err) {
            console.error('Error logging attempt:', err.message);
        } else {
            console.log(`Attempt logged for user ${userID} (Correct: ${isCorrect}).`);
        }
    });
}

// Exports: Provide database functions and connection for external use
module.exports = {
    db,                // The database connection
    addUser,           // Adds a user to the database
    assignChallenge,   // Assigns an active challenge to a user
    logAttempt,        // Logs a user's cryptography attempt
};
