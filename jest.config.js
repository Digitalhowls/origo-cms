module.exports = {
  preset: 'jest-puppeteer',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./tests/setup.js'],
};