export default {
  preset: 'jest-puppeteer',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};