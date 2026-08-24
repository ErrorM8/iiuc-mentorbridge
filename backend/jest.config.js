module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./jest.setup.js'],
  forceExit: true,
  maxWorkers: 1, // run sequentially - fixes parallel DB conflicts
  verbose: true,
};