import { createSlice } from '@reduxjs/toolkit';

export type DemoState = 'ready' | 'preparing' | 'broadcasting';

export const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    value: 'ready' as DemoState,
  },
  reducers: {
    changeState: (state, action) => {
      state.value = action.payload;
    },
  },
})

export const { changeState } = demoSlice.actions;

export default demoSlice.reducer;
