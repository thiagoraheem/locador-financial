// Jest setup file for polyfills
import 'whatwg-fetch';
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder/TextDecoder (required by MSW)
Object.assign(global, { TextDecoder, TextEncoder });

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = require('whatwg-fetch').fetch;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL.createObjectURL
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = jest.fn();
}

// Mock URL.revokeObjectURL
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = jest.fn();
}