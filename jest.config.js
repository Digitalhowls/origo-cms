export default {
  preset: 'jest-puppeteer',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  testTimeout: 120000,
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
};