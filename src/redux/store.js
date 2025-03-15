//redux: state manaement tool
import { configureStore } from '@reduxjs/toolkit'
import activeBoardReducer from './activeBoard/activeBoardSlice'
import userReducer from './user/userSlice'
import activeCardReducer from './activeCard/activeCardSlice'

/**Cấu hình redux persist
 * https://edvins.io/how-to-use-redux-persist-with-redux-toolkit
 */

import { combineReducers } from 'redux' //có sẵn trong redux toolkit không cần cài thêm
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' //Lưu chữ dữ liệu trong storage

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['user'] //Mảng những slice được lưu trữ ở storage
  //blacklist ngược lại của whitelist
}

const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer
})

const persistedReducer = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false // Bỏ qua kiểm tra giá trị không tuần tự hóa
    })
})
