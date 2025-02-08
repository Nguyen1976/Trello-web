import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { darkTheme, lightTheme } from "./theme.js";
import Board from "./pages/Boards/_id.jsx";
import { useMode } from "./context/ModeContext.jsx";

function App() {
  const { isDarkMode } = useMode();

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Board />
    </ThemeProvider>
  );
}

export default App;
