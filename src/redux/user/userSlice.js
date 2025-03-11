import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  currentUser: null
}

//Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
//https://redux-toolkit.js.org/api/createAsyncThunk

export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async data => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/users/login`,
      data
    )
    return response.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
  }
})

export const selectCurrentUser = state => {
  return state.user.currentUser
}

export const {} = userSlice.actions

export default userSlice.reducer
