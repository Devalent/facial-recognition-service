import {
  OpenVidu,
  Publisher,
  Session,
  SignalEvent,
} from 'openvidu-browser'

import { AppDispatch } from '../../store';
import { changeState, setError} from '../../store/demo';
import { addRecognitions, Recognition } from '../../store/recognition';

export class FakeRtcService {
  private interval:NodeJS.Timer;

  constructor(
    private readonly dispatch:AppDispatch,
  ) {}

  async startBroadcast() {
    this.dispatch(changeState('preparing'));

    await new Promise((r) => setTimeout(r, 2000));

    this.dispatch(changeState('broadcasting'));

    this.interval = setInterval(() => {
      console.log('random');
    }, 1000);
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
        resolution: '640x480',
        frameRate: 30,
        mirror: false,
      });

      await this.session.publish(this.publisher);

      this.session.on('signal', (event: SignalEvent) => {
        console.log(event);
        if (event.type === 'recognition') {
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
    if (this.publisher.videoReference !== video) {
      this.publisher.addVideoElement(video);
    }
  }
}
