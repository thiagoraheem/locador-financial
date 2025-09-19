const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  jest: {
    configure: {
      transformIgnorePatterns: [
        'node_modules/(?!(axios)/)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testEnvironment: 'jsdom',
    },
  },
};