const { TextEncoder, TextDecoder } = require('util');

module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
    '^.+\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  globals: {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
  },
};