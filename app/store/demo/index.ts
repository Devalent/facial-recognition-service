import { createSlice } from '@reduxjs/toolkit';

import config from '../../config';

export type DemoState = 'ready' | 'preparing' | 'broadcasting';

export const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    isStandalone: config.use_test_data,
    videoWidth: config.video_width,
    videoHeight: config.video_height,
    status: 'ready' as DemoState,
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
