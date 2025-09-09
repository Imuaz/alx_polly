/**
 * Test setup file for poll actions tests
 * This file is automatically loaded before each test file
 */

import { setupNextMocks } from '@/lib/__mocks__/test-utils'

// Setup global mocks that apply to all test files
setupNextMocks()

// Global test configuration
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks()
})

// Suppress console warnings during tests unless explicitly needed
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})
