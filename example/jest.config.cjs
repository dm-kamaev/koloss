/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],

  moduleNameMapper: {
    '^#user/(.*)$': '<rootDir>/src/module/user/$1',
    '^#order/(.*)$': '<rootDir>/src/module/order/$1',
    '^#/(.*)$': '<rootDir>/src/$1',
    '^#test/(.*)$': '<rootDir>/test/$1',
    '^(\\..*?)\\.js$': '$1',
  },

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': '@swc/jest',
  },

  transformIgnorePatterns: ['node_modules/(?!kysely/)'],

  setupFilesAfterEnv: ['<rootDir>/test/jest/setup.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/test/fake/'],
};
