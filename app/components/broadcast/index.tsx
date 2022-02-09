import Image from 'next/image';
import React, { useContext } from 'react';

import Noise from '../noise';

import WebRtcProvider, { WebRtcContext } from '../../providers/webrtc';

import { useAppSelector } from '../../store';

export default function BroadcastContainer() {
  return (
    <WebRtcProvider>
      <BroadcastComponent />
    </WebRtcProvider>
  );
}

export function BroadcastComponent() {
  const isStandalone = useAppSelector(s => s.demo.isStandalone);
  const status = useAppSelector(s => s.demo.status);
  const videoWidth = useAppSelector(s => s.demo.videoWidth);
  const videoHeight = useAppSelector(s => s.demo.videoHeight);

  const webrtc = useContext(WebRtcContext);

  return (
    <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">
            <div className="col-md-6">
              { status !== 'broadcasting' && 
                  <Noise /> }
              { status === 'broadcasting' && !isStandalone &&
                  <video width={videoWidth} height={videoHeight} ref={e => webrtc.attachVideo(e)} style={{ width: '100%', height: 'auto', maxWidth: videoWidth }}></video> }
              { status === 'broadcasting' && isStandalone &&
                  <Image src="/testcard.png" width={640} height={480} alt="" /> }
            </div>
            <div className="col-md-6">
                <h1 className="display-5 fw-bolder">Facial recognition demo</h1>
                <p className="lead">An example implementation of a real-time facial recognition server that processes WebRTC video streams to detect and to encode faces.</p>
                { isStandalone &&
                  <div className="alert alert-warning">
                    This application runs on pre-processed data (a dataset of celebrity faces) instead of streaming from your webcam to backend. If you want to see a complete example, try running the project yourself. See the GitHub repo for details.
                  </div>
                }
                <div className="d-flex">
                  <div>
                    { (status === 'ready' || status === 'preparing') && 
                      <button
                        className="btn btn-outline-dark flex-shrink-0"
                        type="button"
                        onClick={() => webrtc.startBroadcast()}
                        disabled={status === 'preparing'}
                      >
                        <i className="bi-play-circle-fill me-1"></i>
                        Launch demo
                      </button>
                    }
                    { (status === 'broadcasting') && 
                      <button
                        className="btn btn-outline-dark flex-shrink-0"
                        type="button"
                        onClick={() => webrtc.stopBroadcast()}
                      >
                        <i className="bi-stop-circle-fill me-1"></i>
                        Stop
                      </button>
                    }
                  </div>
                </div>
            </div>
        </div>
    </div>
  )
};
