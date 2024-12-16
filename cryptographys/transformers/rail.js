const MAX_OUTPUT_LENGTH = 1800; // Maximum Rail Fence-encoded output length
const RAIL_GROWTH_RATE = 1;     // Rail Fence Cipher preserves input length

module.exports = {
    name: 'Rail',
    /**
     * Encodes a given input using the Rail Fence Cipher with a random depth between 2 and 4.
     * Avoids trivial cases based on input length.
     * @param {string} input - The input string to encode.
     * @returns {string} - The encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / RAIL_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Determine a valid depth (2–4) based on input length
        let depth;
        if (input.length <= 3) {
            depth = 2; // Input too short for meaningful zigzagging with 3 or 4 rails
        } else if (input.length <= 4) {
            depth = Math.random() < 0.5 ? 2 : 3; // Randomly pick between 2 and 3
        } else {
            depth = Math.floor(Math.random() * 3) + 2; // Randomly pick between 2, 3, or 4
        }

        // Create an array of rows
        const rails = Array.from({ length: depth }, () => []);

        let directionDown = true; // Zigzag direction
        let row = 0;

        // Distribute characters into rails
        for (const char of input) {
            rails[row].push(char);
            if (row === 0) directionDown = true;
            else if (row === depth - 1) directionDown = false;
            row += directionDown ? 1 : -1;
        }

        // Flatten the rails into a single string
        return rails.flat().join('');
    },
};
