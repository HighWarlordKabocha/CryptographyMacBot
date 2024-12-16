const MAX_OUTPUT_LENGTH = 1800; // Maximum Caesar-encoded output length
const CAESAR_GROWTH_RATE = 1;   // Caesar Cipher preserves input length

module.exports = {
    name: 'Caesar',
    /**
     * Encodes a given input string using the Caesar cipher with a random shift.
     * @param {string} input - The input string to encode.
     * @returns {string} - The Caesar-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / CAESAR_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Apply a random shift between 1 and 5
        const shift = Math.floor(Math.random() * 5) + 1;

        // Shift each alphabetic character by the random value
        return input.replace(/[A-Za-z]/g, char => {
            const base = char < 'a' ? 65 : 97; // ASCII base for uppercase/lowercase
            return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
        });
    },
};
