import CssBaseline from '@mui/material/CssBaseline'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { darkTheme, lightTheme } from './theme.js'
import Board from './pages/Boards/_id.jsx'
import { useMode } from './context/ModeContext.jsx'

import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'

function App() {
  const { isDarkMode } = useMode()

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {/* Router DOM */}
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/boards/:boardId" element={<Board />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
