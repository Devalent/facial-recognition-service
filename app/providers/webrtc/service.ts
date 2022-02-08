import {
  OpenVidu,
  Publisher,
  Session,
  SignalEvent,
} from 'openvidu-browser'

import config from '../../config';

import { AppDispatch } from '../../store';
import { changeState, setError} from '../../store/demo';
import { addRecognitions, Recognition } from '../../store/recognition';

import fakeData from './data';

const FAKE_INTERVAL = Math.round((1 / config.recognition_fps) * 1000);

export class FakeRtcService {
  private interval:NodeJS.Timer;

  constructor(
    private readonly dispatch:AppDispatch,
  ) {}

  async startBroadcast() {
    this.dispatch(changeState('preparing'));

    await new Promise((r) => setTimeout(r, 1000));

    this.dispatch(changeState('broadcasting'));

    const lastIndexes:number[] = [];

    this.interval = setInterval(() => {
      const indexes:number[] = [];
      const total = 1; // Math.min(Math.ceil(Math.random() * 2), fakeData.length);

      while (indexes.length < total && lastIndexes.length < fakeData.length) {
        const i = Math.floor(Math.random() * fakeData.length);

        if (!indexes.includes(i) && !lastIndexes.includes(i)) {
          indexes.push(i);
          lastIndexes.push(i);
        }
      }

      const items = indexes.map(i => fakeData[i]);

      if (items.length > 0) {
        this.dispatch(addRecognitions(items));
      }
    }, FAKE_INTERVAL);
  }

  async stopBroadcast() {
    this.dispatch(changeState('ready'));

    this.dispose();
  }

  attachVideo(video:HTMLVideoElement) {}

  private dispose() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}

export class WebRtcService {
  private readonly client:OpenVidu;

  private session:Session;
  private publisher:Publisher;
  private video:HTMLVideoElement;

  constructor(
    private readonly dispatch:AppDispatch,
  ) {
    this.client = new OpenVidu();
  }

  async startBroadcast() {
    this.dispatch(changeState('preparing'));

    try {
      const room = await fetch('/api/webrtc', { method: 'POST' }).then(x => x.json());

      this.session = this.client.initSession();

      this.session.on('exception', (exception) => {
        console.warn('exception', exception);
      });

      await this.session.connect(room.connection, {});

      this.publisher = await this.client.initPublisherAsync(undefined as any, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: false,
        publishVideo: true,
        resolution: `${config.video_width}x${config.video_height}`,
        frameRate: 30,
        mirror: false,
      });

      await this.session.publish(this.publisher);

      this.session.on('signal', (event: SignalEvent) => {
        if (event.type === 'signal:recognition') {
          const items = JSON.parse(event.data) as Recognition[];

          if (items.length > 0) {
            this.dispatch(addRecognitions(items));
          }
        }
      });

      if (this.video) {
        this.publisher.addVideoElement(this.video);
      }

      this.dispatch(changeState('broadcasting'));
    } catch (error) {
      this.dispatch(setError(error.message));
      this.dispatch(changeState('ready'));
    }
  }

  async stopBroadcast() {
    this.dispatch(changeState('ready'));

    this.dispose();
  }

  private dispose() {
    this.publisher = undefined;

    if (this.session) {
      try {
        this.session.off('exception');
        this.session.off('signal');

        this.session.disconnect();
      } catch (e) {}
      this.session = undefined;
    }
  }

  attachVideo(video:HTMLVideoElement) {
    if (this.publisher && this.publisher.videoReference !== video) {
      this.publisher.addVideoElement(video);
    }
  }
}
