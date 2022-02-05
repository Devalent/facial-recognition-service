import {
  OpenVidu,
  Session,
  SignalEvent,
} from 'openvidu-browser';
import React from 'react';

type State = {
  status:'ready'|'preparing'|'broadcasting';
}

export default class BroadcastComponent extends React.Component<{}, State> {
  state:State = {
    status: 'ready',
  };

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
    this.setState((s) => ({
      ...s,
      status: 'preparing',
    }));

    if (!this.client) {
      await new Promise((r) => setTimeout(r, 2000));

      this.setState((s) => ({
        ...s,
        status: 'broadcasting',
      }));
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

      this.setState((s) => ({
        ...s,
        status: 'broadcasting',
      }));
    } catch (error) {
      console.warn(error);
      alert(`WebRTC error: ${error.message}`);

      this.setState((s) => ({
        ...s,
        status: 'ready',
      }));
    }
  }

  render() {
    return (
      <div>
        { (this.state.status === 'ready' || this.state.status === 'preparing') && 
          <button className="btn btn-outline-dark flex-shrink-0" type="button" onClick={() => this.startBroadcast()} disabled={this.state.status === 'preparing'}>
            <i className="bi-play-circle-fill me-1"></i>
            Launch demo
          </button>
        }
      </div>
    )
  }
}
