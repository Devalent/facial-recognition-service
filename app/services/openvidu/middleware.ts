import { createCanvas, createImageData } from 'canvas';
import { EventEmitter } from 'events';
import { nonstandard } from 'wrtc';

import { ConnectionMiddleware } from './connection';

const { RTCVideoSink, RTCVideoSource, i420ToRgba } = nonstandard;

export declare interface WebRtcSnapshotter {
  on(event:'screenshot', handler:(data:string) => void);
}

export class WebRtcSnapshotter extends EventEmitter implements ConnectionMiddleware {
  private intervalId:NodeJS.Timer;
  private sink;
  private track;
  private lastFrame;

  constructor(private readonly interval:number = 1000) {
    super();
  }

  use(peerConnection) {
    if (this.track) {
      throw new Error('Middleware is already used.');
    }

    const source = new RTCVideoSource();
    this.track = source.createTrack();
    const transceiver = peerConnection.addTransceiver(this.track);
    this.sink = new RTCVideoSink(transceiver.receiver.track);

    this.sink.addEventListener('frame', (e) => {
      this.lastFrame = e.frame;
    });

    this.intervalId = setInterval(() => {
      const frame = this.lastFrame;

      if (!frame) {
        return;
      }

      this.lastFrame = undefined;

      const canvas = createCanvas(frame.width,  frame.height);
      const context = canvas.getContext('2d');

      const rgba = new Uint8ClampedArray(frame.width *  frame.height * 4);
      const rgbaFrame = createImageData(rgba, frame.width, frame.height);
      i420ToRgba(frame, rgbaFrame);

      context.putImageData(rgbaFrame, 0, 0);

      this.emit('screenshot', canvas.toDataURL('image/jpeg'));
    }, this.interval);

    const { close } = peerConnection;
    peerConnection.close = () => {
      this.dispose();

      return close.apply(peerConnection, []);
    };
  }

  dispose() {
    this.removeAllListeners();

    this.lastFrame = undefined;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.sink) {
      this.sink.stop();
      this.sink = undefined;
    }

    if (this.track) {
      this.track.stop();
      this.track = undefined;
    }
  }
}
