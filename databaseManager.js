const sqlite3 = require('sqlite3').verbose();

// Open the database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to add a user to the database
function addUser(userID, username) {
    const query = `INSERT OR IGNORE INTO users (userID, username) VALUES (?, ?)`;
    db.run(query, [userID, username], (err) => {
        if (err) console.error('Error adding user:', err.message);
        else console.log(`User ${userID} added or already exists.`);
    });
}

// Function to assign a challenge to a user
function assignChallenge(userID, cryptographyID) {
    const query = `
        INSERT OR REPLACE INTO cryptographyActive (userID, cryptographyID, assignedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    db.run(query, [userID, cryptographyID], (err) => {
        if (err) console.error('Error assigning challenge:', err.message);
        else console.log(`Challenge ${cryptographyID} assigned to user ${userID}.`);
    });
}

// Function to log a user's attempt
function logAttempt(userID, cryptographyID, userAnswer, isCorrect) {
    const query = `
        INSERT INTO cryptographyAttempts (userID, cryptographyID, userAnswer, isCorrect)
        VALUES (?, ?, ?, ?)
    `;
    db.run(query, [userID, cryptographyID, userAnswer, isCorrect], (err) => {
        if (err) console.error('Error logging attempt:', err.message);
        else console.log(`Attempt logged for user ${userID} (Correct: ${isCorrect}).`);
    });
}

// Export all database functions and connection
module.exports = {
    db,           // Export the database connection for reuse
    addUser,
    assignChallenge,
    logAttempt
};
