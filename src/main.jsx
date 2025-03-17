// import { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ModeProvider from './context/ModeContext'
import { Flip, ToastContainer } from 'react-toastify'

//Cấu hình mui dialog
import { ConfirmProvider } from 'material-ui-confirm'
import GlobalStyles from '@mui/material/GlobalStyles'

//redux
import { store } from '~/redux/store'
import { Provider } from 'react-redux'

//Config redux persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
let persistor = persistStore(store)

// là kỹ thuật khi cần sử dụng biến redux store từ file ngoài phạm vi component
import { injectStore } from './utils/authorizeAxios'
injectStore(store)



createRoot(document.getElementById('root')).render(
  //<StrictMode>

  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
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
          <GlobalStyles styles={{ a: { textDecoration: 'none' } }} />
          <App />
          <ToastContainer
            theme="colored"
            position="top-left"
            autoClose={3000}
            transition={Flip}
          />
        </ConfirmProvider>
      </ModeProvider>
    </PersistGate>
  </Provider>
  //</StrictMode>
)
