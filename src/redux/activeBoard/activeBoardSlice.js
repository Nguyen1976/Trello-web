import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceholderCard } from '~/utils/formatters'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

const initialState = {
  currentActiveBoard: null
}

//Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
//https://redux-toolkit.js.org/api/createAsyncThunk

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async boardId => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/v1/boards/${boardId}`
    )
    return response.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  //Nởi xử lý dữ liệu đồng bộ
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      //Việc clone nông khiến cho chúng ta k thể sửa đươc những thằng cấp 2 như mảng cards vậy lên phải cloneDeep
      let board = cloneDeep(action.payload)
      //Xử lý dữ liệu nếu cần thiết...
      board.columns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
      board.columns.forEach(column => {
        if (isEmpty(column?.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      //Update lại dữ liệu của currentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      const incomingCard = action.payload

      const columnContainCard = state.currentActiveBoard.columns.find(
        column => column._id === incomingCard.columnId
      )

      if (columnContainCard) {
        const cardToUpdate = columnContainCard.cards.find(
          card => card._id === incomingCard._id
        )
        if (cardToUpdate) {
          cardToUpdate.title = incomingCard.title
        }
      }

      // Tìm dần từ board -> column -> card
    }
  },
  //extraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: builder => {
    //Trường hợp call api thành công
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      //action.payload ở đây chính là response.data mà chúng ra return khi gọi api ở thằng createAsyncThunk
      const board = action.payload

      state.currentActiveBoard = board
    })
  }
})

export const selectCurrentActiveBoard = state => {
  return state.activeBoard.currentActiveBoard
}

export const { updateCurrentActiveBoard, updateCardInBoard } =
  activeBoardSlice.actions

//Khi export ra sẽ là một thứ j đó tên là reducer
export default activeBoardSlice.reducer
// export const activeBoardReducer = activeBoardSlice.reducer;
