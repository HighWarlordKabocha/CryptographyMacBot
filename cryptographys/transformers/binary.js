const MAX_OUTPUT_LENGTH = 1800; // Maximum binary-encoded output length
const BINARY_GROWTH_RATE = 9;   // Binary encoding with spaces increases input length by 9x

module.exports = {
    name: 'Binary',
    /**
     * Encodes a given input string into binary.
     * Ensures the output length stays within limits by truncating the input if necessary.
     *
     * @param {string} input - The input string to encode.
     * @returns {string} - The binary-encoded string.
     */
    encode: (input) => {
        // Calculate the maximum allowable input length
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / BINARY_GROWTH_RATE);

        // Truncate the input string if it exceeds the allowed length
        if (input.length > maxInputLength) {
            input = input.slice(0, maxInputLength);
        }

        // Convert each character to an 8-bit binary representation with spaces
        return input
            .split('')
            .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ');
    },
};
