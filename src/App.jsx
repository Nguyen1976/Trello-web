import CssBaseline from '@mui/material/CssBaseline'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { darkTheme, lightTheme } from './theme.js'
import Board from './pages/Boards/_id'
import { useMode } from './context/ModeContext'

import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from './pages/Auth/Auth.jsx'

function App() {
  const { isDarkMode } = useMode()

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
          <Route path="/boards/:boardId" element={<Board />} />

          {/* Authentication */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
