const MAX_OUTPUT_LENGTH = 1800; // Maximum reversed output length
const REVERSE_GROWTH_RATE = 1;  // Reverse cipher preserves input length

module.exports = {
    name: 'Reverse',
    /**
     * Encodes a given input by reversing the string.
     * @param {string} input - The input string to encode.
     * @returns {string} - The reversed string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / REVERSE_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Reverse the input string
        return input.split('').reverse().join('');
    },
};
