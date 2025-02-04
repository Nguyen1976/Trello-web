import { cyan, deepOrange, orange, teal } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: teal,
    secondary: deepOrange,
  },
  // spacing: (factor) => `${0.25 * factor}rem`,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: cyan,
    secondary: orange,
  },
  // spacing: (factor) => `${0.25 * factor}rem`,
});
