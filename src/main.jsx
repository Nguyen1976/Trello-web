// import { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ModeProvider from './context/ModeContext'
import { Flip, ToastContainer } from 'react-toastify'

//Cấu hình mui dialog
import { ConfirmProvider } from 'material-ui-confirm'

//redux
import { store } from '~/redux/store'
import { Provider } from 'react-redux'

//react-router-dom with BrowserRouter

createRoot(document.getElementById('root')).render(
  //<StrictMode>

  <Provider store={store}>
    <ModeProvider>
      <ConfirmProvider
        defaultOptions={{
          allowClose: false,
          dialogProps: { maxWidth: 'xs' },
          cancellationButtonProps: { color: 'inherit' },
          confirmationButtonProps: {
            color: 'secondary',
            variant: 'outlined'
          }
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
  </Provider>
  //</StrictMode>
)
