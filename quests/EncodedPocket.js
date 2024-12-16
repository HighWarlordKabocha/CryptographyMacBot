module.exports = {
  name: 'EncodedPocket',
  description: 'An encoding quest.',
  getScenario: () => ':ocean: While surfing along the coast of Cinnabar Island, a Joxic trainer picked up a digital message being broadcast from an abandoned science facility. :satellite: Can you decipher the message?\n> 00110101 00110100 00100000 00110100 00110111 00100000 00110110 01100011 00100000 00110111 00110010 00100000 00110101 01100001 00100000 00110101 00110011 00100000 00110100 00110010 00100000 00110110 00111001 00100000 00110101 00111001 00100000 00110101 00110111 00100000 00110011 00110101 00100000 00110110 01100101 00100000 00110100 00111001 00100000 00110100 00110110 00100000 00110100 00110010 00100000 00110111 00110110 00100000 00110110 00110001 00100000 00110011 00110010 00100000 00110101 00110110 00100000 00110111 00110100 00100000 00110110 00110010 00100000 00110011 00110010 00100000 00110011 00110100 00100000 00110011 01100100',
  validateAnswer: (input) => input.trim() === 'Like bang Pokemon',
  getHint: () => 'What are different methods data values can be stored or represented?',
};