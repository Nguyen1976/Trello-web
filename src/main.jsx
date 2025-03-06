// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ModeProvider from "./context/ModeContext";
import { Flip, ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ModeProvider>
    <App />
    <ToastContainer
      theme="colored"
      position="top-left"
      autoClose={3000}
      transition={Flip}
    />
  </ModeProvider>
  /* </StrictMode> */
);
