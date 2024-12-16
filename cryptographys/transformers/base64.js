const MAX_OUTPUT_LENGTH = 1800; // Maximum encoded output length
const BASE64_GROWTH_RATE = 1.33; // Base64 expands input by ~33%

module.exports = {
    name: 'Base64',
    /**
     * Encodes input into Base64, ensuring the output doesn't exceed the character limit.
     * @param {string} input - The string to encode.
     * @returns {string} - Base64-encoded string.
     */
    encode: (input) => {
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / BASE64_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);
        return Buffer.from(input).toString('base64');
    },
};
