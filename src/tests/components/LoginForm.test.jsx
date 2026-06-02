import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoginForm from '~/pages/Auth/LoginForm'
import userReducer from '~/redux/user/userSlice'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

jest.mock('~/redux/user/userSlice', () => {
  const actual = jest.requireActual('~/redux/user/userSlice')
  return {
    __esModule: true,
    ...actual,
    loginUserAPI: jest.fn(() => ({ type: 'user/loginUserAPI/mock' }))
  }
})

const renderLogin = (initialEntries = ['/login']) => {
  const store = configureStore({ reducer: { user: userReducer } })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <LoginForm />
      </MemoryRouter>
    </Provider>
  )
}

// TC-RTL-LOGIN-01 ... TC-RTL-LOGIN-06 — REQ-UI-01
describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    const userSlice = jest.requireMock('~/redux/user/userSlice')
    userSlice.loginUserAPI.mockClear()
    toast.promise.mockReset()
    // Default: login success
    toast.promise.mockReturnValue({
      then: cb => Promise.resolve(cb({ error: null }))
    })
  })

  it('renders email, password fields and submit button', () => {
    renderLogin()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('login-email')).toBeInTheDocument()
    expect(screen.getByTestId('login-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit')).toHaveTextContent('Login')
  })

  it('shows verifiedEmail success banner when query param is present', () => {
    renderLogin(['/login?verifiedEmail=verified@example.com'])
    expect(screen.getByText(/has been verified/i)).toBeInTheDocument()
    expect(screen.getByText('verified@example.com')).toBeInTheDocument()
  })

  it('shows registeredEmail info banner when query param is present', () => {
    renderLogin(['/login?registeredEmail=new@example.com'])
    expect(screen.getByText(/An email has been sent to/i)).toBeInTheDocument()
    expect(screen.getByText('new@example.com')).toBeInTheDocument()
  })

  it('does NOT navigate when fields are empty (validation blocks submit)', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByTestId('login-submit'))
    const userSlice = jest.requireMock('~/redux/user/userSlice')
    expect(userSlice.loginUserAPI).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('dispatches loginUserAPI and navigates to "/" on successful submit', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByTestId('login-email'), 'user@example.com')
    await user.type(screen.getByTestId('login-password'), 'Password1!')
    await user.click(screen.getByTestId('login-submit'))

    const userSlice = jest.requireMock('~/redux/user/userSlice')
    await waitFor(() => {
      expect(userSlice.loginUserAPI).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password1!'
      })
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('does NOT navigate when login dispatch returns error (covers !res.error branch)', async () => {
    // Simulate login fail: thunk returned { error: <something> }
    toast.promise.mockReturnValue({
      then: cb => Promise.resolve(cb({ error: { message: 'wrong password' } }))
    })

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByTestId('login-email'), 'user@example.com')
    await user.type(screen.getByTestId('login-password'), 'Password1!')
    await user.click(screen.getByTestId('login-submit'))

    const userSlice = jest.requireMock('~/redux/user/userSlice')
    await waitFor(() => {
      expect(userSlice.loginUserAPI).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
