// **DO NOT USE** How would you determine the key? .... Or share the key, idk.

const MAX_OUTPUT_LENGTH = 1800; // Maximum Vigenère-encoded output length
const VIGENERE_GROWTH_RATE = 1; // Vigenère Cipher preserves input length

module.exports = {
    name: 'Vigenère Cipher',
    /**
     * Encodes a given input using the Vigenère cipher with a fixed key.
     * @param {string} input - The input string to encode.
     * @param {string} key - The key to use for the cipher (default: 'KEY').
     * @returns {string} - The encoded string.
     */
    encode: (input, key = 'KEY') => {
        if (!key) throw new Error('A key is required for the Vigenère cipher.');

        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / VIGENERE_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        let keyIndex = 0; // Tracks the position in the key
        const keyUpper = key.toUpperCase(); // Normalize the key to uppercase

        // Apply the Vigenère transformation
        return input.replace(/[A-Za-z]/g, char => {
            const isUpperCase = char < 'a';
            const base = isUpperCase ? 65 : 97; // ASCII base for uppercase/lowercase
            const shift = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65; // Calculate shift
            const encodedChar = String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);

            keyIndex++; // Move to the next key character
            return encodedChar;
        });
    },
};
