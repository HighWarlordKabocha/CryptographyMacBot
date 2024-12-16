module.exports = {
  name: 'sampleQuest',
  description: 'A new quest module.',
  getScenario: () => 'What is 3 + 2?',
  validateAnswer: (input) => input.trim() === '5',
  getHint: () => 'It’s elementary, my dear Watson',
};
