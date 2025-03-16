import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,

  reducers: {
    showModalActiveCard: state => {
      state.isShowModalActiveCard = true
    },
    //Clear data và đóng modal active card
    //prettier-ignore
    clearAndHideCurrentActiveCard: state => {
      state.currentActiveCard = null,
      state.isShowModalActiveCard = false
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

export const selectIsShowActiveCard = state => {
  return state.activeCard.isShowModalActiveCard
}

export const {
  clearAndHideCurrentActiveCard,
  updateCurrentActiveCard,
  showModalActiveCard
} = activeCardSlice.actions

//Khi export ra sẽ là một thứ j đó tên là reducer
export default activeCardSlice.reducer
