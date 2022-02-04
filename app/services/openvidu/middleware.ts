import { createCanvas, createImageData } from 'canvas';
import { EventEmitter } from 'events';
import { nonstandard } from 'wrtc';

import { ConnectionMiddleware } from './connection';

const { RTCVideoSink, RTCVideoSource, i420ToRgba } = nonstandard;

export declare interface WebRtcSnapshotter {
  on(event:'screenshot', handler:(data:string) => void);
}

export class WebRtcSnapshotter extends EventEmitter implements ConnectionMiddleware {
  use(peerConnection) {
    const source = new RTCVideoSource();
    const track = source.createTrack();
    const transceiver = peerConnection.addTransceiver(track);
    const sink = new RTCVideoSink(transceiver.receiver.track);

    let lastFrame = undefined;

    sink.addEventListener('frame', (e) => {
      lastFrame = e.frame;
    });

    const interval = setInterval(() => {
      if (lastFrame) {
        const canvas = createCanvas(lastFrame.width,  lastFrame.height);
        const context = canvas.getContext('2d');

        const rgba = new Uint8ClampedArray(lastFrame.width *  lastFrame.height * 4);
        const rgbaFrame = createImageData(rgba, lastFrame.width, lastFrame.height);
        i420ToRgba(lastFrame, rgbaFrame);

        lastFrame = undefined;

        context.putImageData(rgbaFrame, 0, 0);

        this.emit('screenshot', canvas.toDataURL('image/jpeg'));
      }
    }, 1000);

    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'closed') {
        this.removeAllListeners('screenshot');
        clearInterval(interval);
        sink.stop();
        track.stop();
      }
    });
  }
}
