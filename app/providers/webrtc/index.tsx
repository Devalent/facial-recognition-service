import React, { createContext } from 'react';

import { useAppDispatch, useAppSelector } from '../../store';

import { WebRtcService, FakeRtcService } from './service';

export const WebRtcContext = createContext<WebRtcService>(null);

export default function WebRtcProvider({ children }) {
  let service;

  const dispatch = useAppDispatch();

  if (!service) {
    service = process.env.STANDALONE
      ? new FakeRtcService(dispatch)
      : new WebRtcService(dispatch);
  }

  return (
    <WebRtcContext.Provider value={service}>
      {children}
    </WebRtcContext.Provider>
  );
}

