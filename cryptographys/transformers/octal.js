const MAX_OUTPUT_LENGTH = 1800; // Maximum octal-encoded output length
const OCTAL_GROWTH_RATE = 3 + 1; // Each character becomes 3 digits + 1 space

module.exports = {
    name: 'Octal',
    /**
     * Encodes a given input string into octal.
     * @param {string} input - The input string to encode.
     * @returns {string} - The octal-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / OCTAL_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Convert each character to its octal ASCII representation with spaces
        return input
            .split('')
            .map(char => char.charCodeAt(0).toString(8).padStart(3, '0'))
            .join(' ');
    },
};
