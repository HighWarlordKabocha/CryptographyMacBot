module.exports = {
  name: 'sampleQuest',
  description: 'A sample quest module.',
  getScenario: () => 'What is 2 + 2?',
  validateAnswer: (input) => input.trim() === '4',
  getHint: () => 'It’s elementary, my dear Watson',
};
