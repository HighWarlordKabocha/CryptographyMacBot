const MAX_OUTPUT_LENGTH = 1800; // Maximum ROT13-encoded output length
const ROT13_GROWTH_RATE = 1;    // ROT13 preserves input length

module.exports = {
    name: 'ROT13',
    /**
     * Encodes a given input string using the ROT13 cipher.
     * @param {string} input - The input string to encode.
     * @returns {string} - The ROT13-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / ROT13_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        // Rotate each alphabetic character by 13 places
        return input.replace(/[A-Za-z]/g, char =>
            String.fromCharCode(
                char.charCodeAt(0) + (char.toLowerCase() < 'n' ? 13 : -13)
            )
        );
    },
};
