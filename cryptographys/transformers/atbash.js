const MAX_OUTPUT_LENGTH = 1800; // Maximum Atbash-encoded output length
const ATBASH_GROWTH_RATE = 1;   // Atbash cipher preserves input length

module.exports = {
    name: 'Atbash',
    /**
     * Encodes a given input string using the Atbash cipher.
     * @param {string} input - The input string to encode.
     * @returns {string} - The encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / ATBASH_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Reverse the alphabet for each letter
        return input.replace(/[A-Za-z]/g, char => {
            const base = char < 'a' ? 65 : 97; // Determine ASCII base (uppercase or lowercase)
            const offset = 25 - (char.charCodeAt(0) - base); // Reverse the alphabet position
            return String.fromCharCode(base + offset);
        });
    },
};
