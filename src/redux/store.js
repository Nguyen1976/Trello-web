//redux: state manaement tool
import { configureStore } from '@reduxjs/toolkit'
import activeBoardReducer from './activeBoard/activeBoardSlice'
import userReducer from './user/userSlice'

export const store = configureStore({
  reducer: { activeBoard: activeBoardReducer, user: userReducer }
})
