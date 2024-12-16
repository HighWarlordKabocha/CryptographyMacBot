const MAX_OUTPUT_LENGTH = 1800; // Maximum hexadecimal-encoded output length
const HEX_GROWTH_RATE = 2 + 1;  // Hexadecimal encoding doubles input length + 1 for spaces

module.exports = {
    name: 'Hex',
    /**
     * Encodes a given input string into hexadecimal.
     * @param {string} input - The input string to encode.
     * @returns {string} - The hexadecimal-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / HEX_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Convert input to hexadecimal with spaces between pairs
        return Buffer.from(input)
            .toString('hex')
            .match(/.{1,2}/g)
            .join(' ');
    },
};
