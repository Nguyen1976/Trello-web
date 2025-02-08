import { useMediaQuery } from "@mui/material";
import { createContext, useContext, useState } from "react";

const ModeContext = createContext();

// eslint-disable-next-line react/prop-types
export default function ModeProvider({ children }) {
  const isDarkModeWindow = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const mode = localStorage.getItem("mode");
    if (mode === null) return isDarkModeWindow;
    return mode === "dark";
  });
  return (
    <ModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMode = () => useContext(ModeContext);
