import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../../app/store";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLong: number;
  maxLong: number;
}

export interface Position {
  posLat: number;
  posLong: number;
}

export interface PlacesState extends Bounds, Position {}

const initialState: PlacesState = {
  minLat: 0,
  maxLat: 0,
  minLong: 0,
  maxLong: 0,
  posLat: 51.505,
  posLong: -0.09,
};

export const placesSlice = createSlice({
  name: "places",
  initialState,
  reducers: {
    setBounds: (state, action: PayloadAction<Bounds>) => {
      state.minLat = action.payload.minLat;
      state.maxLat = action.payload.maxLat;
      state.minLong = action.payload.minLong;
      state.maxLong = action.payload.maxLong;
    },
    setPosition: (state, action: PayloadAction<Position>) => {
      state.posLat = action.payload.posLat;
      state.posLong = action.payload.posLong;
    },
  },
});

export const { setBounds, setPosition } = placesSlice.actions;

export const selectBounds = (state: RootState) => {
  return {
    minLat: state.places.minLat,
    maxLat: state.places.maxLat,
    minLong: state.places.minLong,
    maxLong: state.places.maxLong,
  };
};

export const selectPosition = (state: RootState) => {
  return { posLat: state.places.posLat, posLong: state.places.posLong };
};

export default placesSlice.reducer;
