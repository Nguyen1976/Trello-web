import CssBaseline from '@mui/material/CssBaseline'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { darkTheme, lightTheme } from './theme.js'
import Board from './pages/Boards/_id'
import { useMode } from './context/ModeContext'

import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from './pages/Auth/Auth.jsx'
import AccountVerifycation from './pages/Auth/AccountVerifycation.jsx'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from './redux/user/userSlice.js'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to="/login" replace={true} />
  return <Outlet />//Là nó sẽ chạy vào nhưng route child được chứa bên trong nó
}

function App() {
  const { isDarkMode } = useMode()

  const currentUser = useSelector(selectCurrentUser)

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {/* Router DOM */}
      <BrowserRouter basename="/">
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to="/boards/67c868e67a889567f62a968d" replace={true} />
            }
          />
          {/* Những Route nào yêu cầu phải đã đăng nhập rồi mới được vào thì bỏ vào đây */}
          <Route element={<ProtectedRoute user={currentUser} />}>
            {/* Board Details */}
            <Route path="/boards/:boardId" element={<Board />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          <Route
            path="/account/verification"
            element={<AccountVerifycation />}
          />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
