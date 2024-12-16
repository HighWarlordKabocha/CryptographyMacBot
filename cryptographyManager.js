const path = require('path');
const fs = require('fs');

// Paths: Define file locations for state, records, and modules
const activeCryptographyPath = path.resolve(__dirname, 'data', 'activeCryptography.json'); // Tracks the current active cryptography settings
const recordsPath = path.resolve(__dirname, 'data', 'cryptographyRecords.json'); // Stores user performance records
const transformersPath = path.resolve(__dirname, 'cryptographys/transformers'); // Directory for transformer modules
const wordlistsPath = path.resolve(__dirname, 'cryptographys/wordlists'); // Directory for wordlists
const ruleSetsPath = path.resolve(__dirname, 'cryptographys/ruleSets'); // Directory for rule set configurations

// In-memory store for user-specific active challenges
const activeChallenges = new Map(); // Maps user IDs to their current cryptography challenges

/**
 * Utility: Load JSON file
 * Reads and parses a JSON file from the provided path.
 * @param {string} filePath - Path to the JSON file
 * @returns {Object|null} - Parsed JSON object, or null on failure
 */
function loadJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Failed to load JSON file at ${filePath}:`, error);
        return null;
    }
}

/**
 * Utility: Write JSON file
 * Serializes an object to JSON and writes it to the specified file path.
 * @param {string} filePath - Path to the file
 * @param {Object} data - Data to write
 */
function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to write JSON file at ${filePath}:`, error);
    }
}

/**
 * Loads the active cryptography configuration.
 * The configuration specifies the wordlist and rule set currently in use.
 * @returns {Object|null} - The active cryptography configuration
 */
function loadActiveCryptography() {
    return loadJson(activeCryptographyPath);
}

/**
 * Loads the active wordlist.
 * Reads the wordlist specified in the active cryptography configuration.
 * @returns {Array|null} - An array of strings from the wordlist, or null on failure
 */
function loadActiveWordlist() {
    const activeConfig = loadActiveCryptography();
    if (!activeConfig || !activeConfig.wordlist) {
        console.error('No active wordlist specified.');
        return null;
    }

    const filePath = path.resolve(wordlistsPath, activeConfig.wordlist);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent.trim().split('\n');
    } catch (error) {
        console.error(`Failed to load wordlist (${activeConfig.wordlist}):`, error);
        return null;
    }
}

/**
 * Loads the active rule set.
 * Reads the rule set specified in the active cryptography configuration.
 * Rule sets define which transformers are available for use.
 * @returns {Object|null} - The active rule set, or null on failure
 */
function loadActiveRuleSet() {
    const activeConfig = loadActiveCryptography();
    if (!activeConfig || !activeConfig.ruleSet) {
        console.error('No active rule set specified.');
        return null;
    }

    const filePath = path.resolve(ruleSetsPath, activeConfig.ruleSet);
    try {
        return require(filePath);
    } catch (error) {
        console.error(`Failed to load rule set (${activeConfig.ruleSet}):`, error);
        return null;
    }
}

/**
 * Loads all available transformers dynamically.
 * Transformers are modules that define encoding methods (e.g., Base64, Binary).
 * Logs any invalid transformers it encounters.
 */
let transformers = [];
function loadTransformers() {
    try {
        const files = fs.readdirSync(transformersPath).filter(file => file.endsWith('.js'));
        transformers = files.map(file => {
            const transformer = require(path.join(transformersPath, file));
            if (!transformer.name || typeof transformer.encode !== 'function') {
                console.error(`Invalid transformer in ${file}.`);
                return null;
            }
            return transformer;
        }).filter(Boolean); // Remove invalid transformers
        console.log('Transformers loaded:', transformers.map(t => t.name).join(', '));
    } catch (error) {
        console.error('Failed to load transformers:', error);
    }
}

/**
 * Retrieves all loaded transformers.
 * @returns {Array} - Array of loaded transformer objects
 */
function getTransformers() {
    return transformers;
}

/**
 * Generates a random cryptography challenge for a user.
 * The challenge includes a randomly selected word and a randomly applied transformer.
 * @param {string} userId - The ID of the user
 * @returns {Object|null} - The generated challenge object, or null on failure
 */
function generateRandomChallenge(userId) {
    const wordlist = loadActiveWordlist();
    const ruleSet = loadActiveRuleSet();
    if (!wordlist || !ruleSet) {
        console.error('Missing wordlist or rule set.');
        return null;
    }

    const availableTransformers = getTransformers().filter(t => ruleSet.activeMethods.includes(t.name));
    if (availableTransformers.length === 0) {
        console.error('No transformers match the active rule set.');
        return null;
    }

    const randomString = wordlist[Math.floor(Math.random() * wordlist.length)];
    const randomTransformer = availableTransformers[Math.floor(Math.random() * availableTransformers.length)];

    const challenge = {
        original: randomString,
        encoded: randomTransformer.encode(randomString),
        method: randomTransformer.name,
    };

    activeChallenges.set(userId, challenge); // Store the challenge for the user
    return challenge;
}

/**
 * Retrieves the active challenge for a specific user.
 * @param {string} userId - The ID of the user
 * @returns {Object|null} - The user's active challenge, or null if none exists
 */
function getActiveChallenge(userId) {
    return activeChallenges.get(userId) || null;
}

/**
 * Clears the active challenge for a specific user.
 * @param {string} userId - The ID of the user
 */
function clearActiveChallenge(userId) {
    activeChallenges.delete(userId);
}

/**
 * Reads all user records from the cryptography records file.
 * @returns {Object} - The user records object
 */
function readRecords() {
    if (!fs.existsSync(recordsPath)) return { users: {} };
    return loadJson(recordsPath) || { users: {} };
}

/**
 * Writes updated user records to the cryptography records file.
 * @param {Object} data - The updated user records object
 */
function writeRecords(data) {
    writeJson(recordsPath, data);
}

/**
 * Increments the success count for a specific user.
 * If the user doesn't exist, creates a new record for them.
 * @param {string} userId - The ID of the user
 * @param {string} username - The username of the user
 */
function incrementUserRecord(userId, username) {
    const records = readRecords();

    if (!records.users[userId]) {
        records.users[userId] = { username, successes: 0 };
    }

    records.users[userId].successes += 1;
    writeRecords(records);
}

/**
 * Retrieves the record for a specific user.
 * @param {string} userId - The ID of the user
 * @returns {Object} - The user's record, or a default object if none exists
 */
function getUserRecord(userId) {
    const records = readRecords();
    return records.users[userId] || { username: null, successes: 0 };
}

// Initialize transformers on load
loadTransformers();

// Exports
module.exports = {
    loadActiveCryptography,
    generateRandomChallenge,
    getActiveChallenge,
    clearActiveChallenge,
    getTransformers,
    incrementUserRecord,
    getUserRecord,
};
