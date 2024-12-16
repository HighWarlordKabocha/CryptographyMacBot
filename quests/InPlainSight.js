module.exports = {
  name: 'InPlainSight',
  description: 'Description',
  getScenario: () => 'Someone has infiltrated Joxic HQ and encrypted all the data; now no one without the encryption key will be able to access the data! However, we traced infiltrator activity to https://github.com/IsabelleRIP2000/RememberIsabelle and know for a fact that DefinitelyNotTheKey.txt was used to encrypt the data. Can you crack it?',
  validateAnswer: (input) => input.trim() === 'H0ll0w_M4n',
  getHint: () => 'To the untrained eye, DefinitelyNotTheKey.txt contains nothing... But DefinitelyNotTheKey.txt contains *everything.*',
};
