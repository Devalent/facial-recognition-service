import {
  OpenVidu,
  Publisher,
  Session,
  SignalEvent,
} from 'openvidu-browser';
import React from 'react';

import { useAppSelector, useAppDispatch } from '../../store';
import { changeState, setError, DemoState } from '../../store/demo';

class Broadcast extends React.Component<{
  isStandalone:boolean;
  state:DemoState;
  onStateChanged:(state:DemoState) => void;
  onError:(error:Error) => void;
  video:HTMLVideoElement;
}> {
  private client:OpenVidu;
  private session:Session;
  private publisher:Publisher;

  componentDidMount() {
    if (!this.props.isStandalone) {
      this.client = new OpenVidu();

      // this.client.enableProdMode();
    }
  }

  componentWillUnmount() {
    this.dispose();    
  }

  componentDidUpdate() {
    const { video } = this.props;

    if (this.props.state === 'broadcasting' && video) {
      this.attachVideo(video);
    }
  }

  private async startBroadcast() {
    this.props.onStateChanged('preparing');

    if (this.props.isStandalone) {
      await new Promise((r) => setTimeout(r, 2000));

      this.props.onStateChanged('broadcasting');
      return;
    }

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

      this.session.on('signal', (event:SignalEvent) => {
        console.log(JSON.parse(event.data));
      });

      this.props.onStateChanged('broadcasting');

      if (this.props.video) {
        this.attachVideo(this.props.video);
      }
    } catch (error) {
      this.dispose();

      this.props.onStateChanged('ready');
      this.props.onError(error);
    }
  }

  private async stopBroadcast() {
    this.props.onStateChanged('ready');

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

  private attachVideo(video:HTMLVideoElement) {
    if (this.props.isStandalone) {
      return;
    }

    if (this.publisher.videoReference !== video) {
      this.publisher.addVideoElement(video);
    }
  }

  render() {
    const { state } = this.props;

    return (
      <div>
        { (state === 'ready' || state === 'preparing') && 
          <button
            className="btn btn-outline-dark flex-shrink-0"
            type="button"
            onClick={() => this.startBroadcast()}
            disabled={state === 'preparing'}
          >
            <i className="bi-play-circle-fill me-1"></i>
            Launch demo
          </button>
        }
        { (state === 'broadcasting') && 
          <button
            className="btn btn-outline-dark flex-shrink-0"
            type="button"
            onClick={() => this.stopBroadcast()}
          >
            <i className="bi-stop-circle-fill me-1"></i>
            Stop
          </button>
        }
      </div>
    )
  }
}

export default function BroadcastComponent({ video }) {
  const isStandalone = useAppSelector(s => s.demo.isStandalone);
  const state = useAppSelector(s => s.demo.status);
  const dispatch = useAppDispatch();

  return <Broadcast
    isStandalone={isStandalone}
    state={state}
    video={video}
    onStateChanged={(s) => dispatch(changeState(s))}
    onError={(err) => dispatch(setError(err.message))} />
};
