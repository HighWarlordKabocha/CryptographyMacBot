const MAX_OUTPUT_LENGTH = 1800; // Maximum ASCII-encoded output length
const ASCII_GROWTH_RATE = 3+1;    // ASCII encoding increases input length by ~3x, +1 for space

module.exports = {
    name: 'ASCII',
    /**
     * Encodes a given input string into ASCII codes.
     * @param {string} input - The input string to encode.
     * @returns {string} - The ASCII-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / ASCII_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Convert each character to ASCII code
        return input
            .split('')
            .map(char => char.charCodeAt(0))
            .join(' ');
    },
};
