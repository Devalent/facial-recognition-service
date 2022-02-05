import { createSlice } from '@reduxjs/toolkit';

type State = 'ready'|'preparing'|'broadcasting';

export const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    value: 'ready' as State,
  },
  reducers: {
    connect: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value = 'preparing';
    },
    broadcast: (state) => {
      state.value = 'broadcasting';
    },
    disconnect: (state) => {
      state.value = 'ready';
    },
  },
})

// Action creators are generated for each case reducer function
export const { connect, broadcast, disconnect } = demoSlice.actions;

export default demoSlice.reducer;
