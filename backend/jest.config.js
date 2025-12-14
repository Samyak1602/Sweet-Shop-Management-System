export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  verbose: true,
  transform: {},
  testTimeout: 10000,
  detectOpenHandles: true,
  forceExit: true,
};
