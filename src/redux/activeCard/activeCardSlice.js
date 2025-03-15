import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentActiveCard: null
}

export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,

  reducers: {
    clearCurrentActiveCard: state => {
      state.currentActiveCard = null
    },
    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload

      state.currentActiveCard = fullCard
    }
  }
})

export const selectCurrentActiveCard = state => {
  return state.activeCard.currentActiveCard
}

export const { clearCurrentActiveCard, updateCurrentActiveCard } =
  activeCardSlice.actions

//Khi export ra sẽ là một thứ j đó tên là reducer
export default activeCardSlice.reducer
