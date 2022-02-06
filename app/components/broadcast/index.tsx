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

  const webrtc = useContext(WebRtcContext);

  return (
    <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">
            <div className="col-md-6">
              { status !== 'broadcasting' && 
                  <Noise /> }
              { status === 'broadcasting' && !isStandalone &&
                  <video width={640} height={480} ref={e => webrtc.attachVideo(e)} style={{ width: '100%', height: 'auto', maxWidth: 640 }}></video> }
              { status === 'broadcasting' && isStandalone &&
                  <div>Video</div> }
            </div>
            <div className="col-md-6">
                <h1 className="display-5 fw-bolder">Facial recognition demo</h1>
                <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?</p>
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
