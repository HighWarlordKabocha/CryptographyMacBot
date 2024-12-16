const path = require('path');
const fs = require('fs');

// Paths: Define file locations for quest state and leaderboard
const activeQuestPath = path.resolve(__dirname, 'data', 'activeQuest.json'); // Tracks the currently active quest
const leaderboardPath = path.resolve(__dirname, 'data', 'leaderboard.json'); // Stores user leaderboard data

/**
 * Utility: Reads and parses a JSON file.
 * Returns an empty object if the file doesn't exist or is empty.
 * @param {string} filePath - Path to the JSON file
 * @returns {Object} - Parsed JSON data or an empty object
 */
function readJsonFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return {}; // Return an empty object if the file doesn't exist
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (!fileContent.trim()) {
            return {}; // Return an empty object if the file is empty
        }

        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Failed to read file: ${filePath}`, error);
        return {};
    }
}

/**
 * Utility: Writes data to a JSON file.
 * Serializes the data and writes it to the specified file.
 * @param {string} filePath - Path to the JSON file
 * @param {Object} data - Data to write
 */
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to write file: ${filePath}`, error);
    }
}

/**
 * Retrieves the name of the currently active quest.
 * Reads from the `activeQuest.json` file.
 * @returns {string|null} - The name of the active quest or null if none is set
 */
function getCurrentQuest() {
    const data = readJsonFile(activeQuestPath);
    return data?.currentQuest || null;
}

/**
 * Validates a quest module to ensure it contains required functions.
 * Logs an error if required functions are missing.
 * @param {Object} quest - The quest module to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateQuestModule(quest) {
    if (!quest) {
        console.error('Invalid quest: Module is undefined or null.');
        return false;
    }

    const requiredFunctions = ['getScenario', 'validateAnswer'];
    const missingFunctions = requiredFunctions.filter(func => typeof quest[func] !== 'function');

    if (missingFunctions.length > 0) {
        console.error(`Invalid quest: Missing required functions: ${missingFunctions.join(', ')}`);
        return false;
    }

    return true;
}

/**
 * Dynamically loads a quest module by name.
 * The module is expected to reside in the `quests` directory.
 * @param {string} questName - Name of the quest module to load
 * @returns {Object|null} - The loaded quest module, or null on failure
 */
function loadQuest(questName) {
    try {
        const questPath = path.resolve(__dirname, 'quests', `${questName}.js`);
        return require(questPath);
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error(`Failed to load quest: "${questName}". Check spelling in activeQuest.json.`);
        } else {
            console.error(`Unexpected error while loading quest "${questName}":`, error);
        }
        return null;
    }
}

/**
 * Adds a user to the leaderboard for a specific quest.
 * If the quest or user entry doesn't exist, it creates one.
 * @param {string} questName - The name of the quest
 * @param {string} userId - The ID of the user
 * @param {string} username - The username of the user
 */
function addToLeaderboard(questName, userId, username) {
    const leaderboard = readJsonFile(leaderboardPath);

    if (!leaderboard[questName]) {
        leaderboard[questName] = {
            description: "No description available.",
            users: []
        };
    }

    const questData = leaderboard[questName];

    if (!questData.users.some(user => user.userId === userId)) {
        questData.users.push({ userId, username });
        writeJsonFile(leaderboardPath, leaderboard);
        console.log(`User ${username} added to the leaderboard for ${questName}.`);
    } else {
        console.log(`User ${username} is already on the leaderboard for ${questName}.`);
    }
}

/**
 * Retrieves the leaderboard for a specific quest.
 * @param {string} questName - The name of the quest
 * @returns {Object} - The leaderboard for the quest, or a default object if none exists
 */
function getQuestLeaderboard(questName) {
    const leaderboard = readJsonFile(leaderboardPath);
    return leaderboard[questName] || { description: "No data available.", users: [] };
}

/**
 * Retrieves the global leaderboard across all quests.
 * @returns {Object} - The global leaderboard object
 */
function getGlobalLeaderboard() {
    return readJsonFile(leaderboardPath);
}

/**
 * Validates a user's answer for the current quest.
 * Ensures the current quest is active and the module is valid before validating the answer.
 * @param {string} input - The user's answer
 * @returns {boolean} - True if the answer is correct, false otherwise
 */
function validateAnswer(input) {
    const currentQuestName = getCurrentQuest();
    if (!currentQuestName) {
        console.error('No active quest to validate the answer.');
        return false;
    }

    const currentQuest = loadQuest(currentQuestName);
    if (currentQuest && validateQuestModule(currentQuest)) {
        return currentQuest.validateAnswer(input);
    }

    console.error(`Quest "${currentQuestName}" is invalid or does not have a validateAnswer function.`);
    return false;
}

/**
 * Retrieves the scenario for the current quest.
 * @returns {string} - The scenario text, or a default message if none is active
 */
function getScenario() {
    const currentQuestName = getCurrentQuest();
    if (!currentQuestName) {
        return 'No quest is currently active.';
    }

    const currentQuest = loadQuest(currentQuestName);
    if (currentQuest && validateQuestModule(currentQuest)) {
        return currentQuest.getScenario();
    }

    return 'No active quest at the moment.';
}

/**
 * Retrieves a hint for the current quest.
 * If the quest module has a `getHint` function, calls it.
 * @returns {string} - The hint text, or a default message if none is available
 */
function getHint() {
    const currentQuestName = getCurrentQuest();
    if (!currentQuestName) {
        return 'No quest is currently active.';
    }

    const currentQuest = loadQuest(currentQuestName);
    if (currentQuest && typeof currentQuest.getHint === 'function') {
        return currentQuest.getHint();
    }

    return 'No hints available for this quest.';
}

// Exports
module.exports = {
    getCurrentQuest,         // Retrieves the current active quest name
    loadQuest,               // Dynamically loads a quest module
    validateQuestModule,     // Validates the structure of a quest module
    addToLeaderboard,        // Adds a user to the leaderboard for a quest
    getQuestLeaderboard,     // Retrieves the leaderboard for a specific quest
    getGlobalLeaderboard,    // Retrieves the global leaderboard
    validateAnswer,          // Validates a user's answer for the active quest
    getScenario,             // Retrieves the scenario for the active quest
    getHint,                 // Retrieves a hint for the active quest
};
