import { configureStore } from "@reduxjs/toolkit";
import plantsReducer from "./plantsSlice";

export const store = configureStore({
  reducer: {
    plants: plantsReducer
  }
});
