import Button from "@mui/material/Button";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Typography from "@mui/material/Typography";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "./theme.js";
import { useState } from "react";
import { Switch } from "@mui/material";

function App() {
  const isDarkModeWindow = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeWindow);
  const changeTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div>
        <Typography variant="body2" color="text.secondary">
          Dark Mode
        </Typography>
        <Switch
          checked={isDarkMode}
          onChange={changeTheme}
          name="loading"
          color="primary"
        />
        <div>Nguyên đẹp trai</div>
        <Typography variant="body2" color="text.secondary">
          Khà khà
        </Typography>
        <AccountBalanceIcon color="primary" />
        <Button variant="text">Text</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
      </div>
    </ThemeProvider>
  );
}

export default App;
