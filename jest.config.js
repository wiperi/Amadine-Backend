module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    maxWorkers: 1,
    verbose: true,
    silent: false,
    transform: {
      '^.+\\.(ts|tsx|js)$': 'ts-jest'
    },
  };
  