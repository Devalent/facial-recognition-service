import {
  OpenVidu,
  Session,
  SignalEvent,
} from 'openvidu-browser';
import React from 'react';

import { useAppSelector, useAppDispatch } from '../../store';
import { changeState, DemoState } from '../../store/demo';

class Broadcast extends React.Component<{
  state:DemoState;
  stateChanged:(state:DemoState) => void;
}> {
  private client:OpenVidu;
  private session:Session;

  componentDidMount() {
    if (!process.env.STANDALONE) {
      this.client = new OpenVidu();

      // this.client.enableProdMode();
    }
  }

  componentWillUnmount() {
    if (this.session) {
      try {
        this.session.off('exception');
        this.session.disconnect();
      } catch (e) {
        console.warn(e);
      } finally {
        this.session = undefined;
      }
    }
  }

  private async startBroadcast() {
    this.props.stateChanged('preparing');

    if (!this.client) {
      await new Promise((r) => setTimeout(r, 2000));

      this.props.stateChanged('broadcasting');
      return;
    }

    try {
      const room = await fetch('/api/webrtc', { method: 'POST' }).then(x => x.json());

      this.session = this.client.initSession();

      this.session.on('exception', (exception) => {
        console.warn('exception', exception);
      });

      await this.session.connect(room.connection, {});

      const publisher = await this.client.initPublisherAsync(undefined as any, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        mirror: false,
      });
    
      await this.session.publish(publisher);

      this.session.on('signal:recognition', (event:SignalEvent) => {
        console.log(JSON.parse(event.data));
      });

      this.props.stateChanged('broadcasting');
    } catch (error) {
      console.warn(error);
      alert(`WebRTC error: ${error.message}`);

      this.props.stateChanged('ready');
    }
  }

  render() {
    const { state } = this.props;

    return (
      <div>
        { (state === 'ready' || state === 'preparing') && 
          <button className="btn btn-outline-dark flex-shrink-0" type="button" onClick={() => this.startBroadcast()} disabled={state === 'preparing'}>
            <i className="bi-play-circle-fill me-1"></i>
            Launch demo
          </button>
        }
      </div>
    )
  }
}

export default function BroadcastComponent() {
  const state = useAppSelector(s => s.demo.value);
  const dispatch = useAppDispatch();

  return <Broadcast state={state} stateChanged={(s) => dispatch(changeState(s))} />
};
