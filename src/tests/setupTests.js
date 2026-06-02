import '@testing-library/jest-dom'

jest.mock('react-toastify', () => ({
  toast: {
    promise: jest.fn(() => Promise.resolve({ error: null }))
  }
}))
