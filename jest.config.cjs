/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: ['**/src/tests/**/*.test.{js,jsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/selenium/'],
  collectCoverageFrom: [
    'src/pages/Auth/LoginForm.jsx',
    'src/pages/Boards/_id.jsx',
    'src/pages/Boards/BoardContent/ListColumns/Column/ListCards/Card/Card.jsx',
    'src/utils/validators.js'
  ],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    }
  }
}
