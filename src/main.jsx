// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ModeProvider from "./context/ModeContext";
import { Flip, ToastContainer } from "react-toastify";

//Cấu hình mui dialog
import { ConfirmProvider } from "material-ui-confirm";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ModeProvider>
    <ConfirmProvider
      defaultOptions={{
        allowClose: false,
        dialogProps: { maxWidth: "xs" },
        cancellationButtonProps: { color: "inherit" },
        confirmationButtonProps: { color: "secondary", variant: "outlined" },
      }}
    >
      <App />
      <ToastContainer
        theme="colored"
        position="top-left"
        autoClose={3000}
        transition={Flip}
      />
    </ConfirmProvider>
  </ModeProvider>
  /* </StrictMode> */
);
