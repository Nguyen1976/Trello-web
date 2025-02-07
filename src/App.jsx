import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { darkTheme, lightTheme } from "./theme.js";
import Board from "./pages/Boards/_id.jsx";

function App() {
  const [mode] = useState(localStorage.getItem("mode") || "light");

  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      <CssBaseline />
      <Board />
    </ThemeProvider>
  );
}

export default App;
