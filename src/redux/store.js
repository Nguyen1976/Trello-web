//redux: state manaement tool
import { configureStore } from "@reduxjs/toolkit";
import activeBoardReducer from "./activeBoard/activeBoardSlice";

export const store = configureStore({
  reducer: { activeBoard: activeBoardReducer },
});
