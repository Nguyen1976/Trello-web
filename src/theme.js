import { cyan, deepOrange, orange, teal } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  trello: {
    appBarHeight: "58px",
    boardBarHeight: "60px",
  },
  palette: {
    mode: "light",
    primary: teal,
    secondary: deepOrange,
  },
});

export const darkTheme = createTheme({
  trello: {
    appBarHeight: "58px",
    boardBarHeight: "60px",
  },
  palette: {
    mode: "dark",
    primary: cyan,
    secondary: orange,
  },
});
