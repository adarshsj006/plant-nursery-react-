import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* -------- FETCH PLANTS FROM BACKEND -------- */
export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async () => {
    const res = await fetch("http://localhost:5000/plants");
    return res.json();
  }
);

const plantsSlice = createSlice({
  name: "plants",
  initialState: {
    list: [],
    status: "idle"
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "success";
      });
  }
});

export default plantsSlice.reducer;
