import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { interfaces } from 'inversify'

export type ThemeColors = 'light' | 'dark';

export interface AppState {
  theme: ThemeColors,
  container?: interfaces.Container
}

const initialState: AppState = {
  theme: 'light',
  container: undefined,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setContainer: (state, action: PayloadAction<interfaces.Container>) => {
      state.container = action.payload
    },
    setTheme: (state, action: PayloadAction<ThemeColors>) => {
      state.theme = action.payload
    },
  },
  extraReducers: (builder) => {
    // empty handler
  },
})

export const {
  setContainer,
  setTheme,
} = appSlice.actions
export const appReducer = appSlice.reducer
