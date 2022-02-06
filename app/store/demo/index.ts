import { createSlice } from '@reduxjs/toolkit';

export type DemoState = 'ready' | 'preparing' | 'broadcasting';

export const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    isStandalone: !!process.env.STANDALONE,
    status: 'ready' as DemoState,
    video: null as HTMLVideoElement,
  },
  reducers: {
    changeState: (state, action) => {
      state.status = action.payload;
    },
  },
})

export const { changeState } = demoSlice.actions;

export const setError = (message:string) => (dispatch, getState) => {
  alert(`WebRTC error: ${message}`);
};

export default demoSlice.reducer;
