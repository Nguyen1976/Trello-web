import axios from "axios";
import { isEmpty } from "lodash";
import { mapOrder } from "~/utils/sorts";
import { API_ROOT } from "~/utils/constants";
import { generatePlaceholderCard } from "~/utils/formatters";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  currentActiveBoard: null,
};

//Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
//https://redux-toolkit.js.org/api/createAsyncThunk

export const fetchBoardDetailsAPI = createAsyncThunk(
  "activeBoard/fetchBoardDetailsAPI",
  async (boardId) => {
    const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
    return response.data;
  }
);

export const activeBoardSlice = createSlice({
  name: "activeBoard",
  initialState,
  //Nởi xử lý dữ liệu đồng bộ
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      let board = action.payload;

      //Xử lý dữ liệu nếu cần thiết...
      board.columns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          column.cards = mapOrder(column?.cards, column?.cardOrderIds, "_id");
        }
      });

      //Update lại dữ liệu của currentActiveBoard
      state.currentActiveBoard = board;
    },
  },
  //extraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    //Trường hợp call api thành công
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      //action.payload ở đây chính là response.data mà chúng ra return khi gọi api ở thằng createAsyncThunk
      const board = action.payload;

      state.currentActiveBoard = board;
    });
  },
});

export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard;
};

export const { updateCurrentActiveBoard } = activeBoardSlice.actions;

//Khi export ra sẽ là một thứ j đó tên là reducer
export default activeBoardSlice.reducer;
// export const activeBoardReducer = activeBoardSlice.reducer;
