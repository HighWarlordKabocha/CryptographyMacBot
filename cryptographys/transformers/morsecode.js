const MAX_OUTPUT_LENGTH = 1800; // Maximum Morse-encoded output length
const MORSE_GROWTH_RATE = 5 + 1; // Morse code multiplies input length by ~5x + 1 for spaces

module.exports = {
    name: 'Morse',
    /**
     * Encodes a given input string into Morse code.
     * @param {string} input - The input string to encode.
     * @returns {string} - The Morse-encoded string.
     */
    encode: (input) => {
        // Enforce input length limit
        const maxInputLength = Math.floor(MAX_OUTPUT_LENGTH / MORSE_GROWTH_RATE);
        if (input.length > maxInputLength) input = input.slice(0, maxInputLength);

        const morseCodeMap = {
            'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
            'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
            'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
            'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
            'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
            'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
            'Y': '-.--',  'Z': '--..',
            '1': '.----', '2': '..---', '3': '...--', '4': '....-',
            '5': '.....', '6': '-....', '7': '--...', '8': '---..',
            '9': '----.', '0': '-----',
            ' ': '/',     '.': '.-.-.-', ',': '--..--', '?': '..--..',
            '\'': '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
            ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
            '=': '-...-',  '+': '.-.-.',  '-': '-....-', '_': '..--.-',
            '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
        };

        // Convert to uppercase and encode into Morse code
        return input.toUpperCase()
            .split('')
            .map(char => morseCodeMap[char] || '')
            .join(' ');
    },
};
