/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use the js-with-ts preset so ts-jest processes Kysely's .js files
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],

  // MERGED: All your path aliases live happily in ONE object now
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // Tell Jest NOT to ignore Kysely inside node_modules
  transformIgnorePatterns: ['node_modules/(?!kysely/)'],

  setupFilesAfterEnv: ['<rootDir>/test/jest/setup.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/test/fake/'],
};
