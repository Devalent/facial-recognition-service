import {
  OpenVidu,
  Session,
} from 'openvidu-browser';
import React from 'react';

import styles from './broadcast.module.scss';

type State = {
  broadcasting:boolean;
}

export class BroadcastComponent extends React.Component<{}, State> {
  state = {
    broadcasting: false,
  };

  private client:OpenVidu;
  private session:Session;

  componentDidMount() {
    this.client = new OpenVidu();

    // this.client.enableProdMode();
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
      broadcasting: true,
    }));

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
    } catch (error) {
      console.warn(error);
      alert(`WebRTC error: ${error.message}`);

      this.setState((s) => ({
        ...s,
        broadcasting: false,
      }));
    }
  }

  render() {
    return (
      <div className={styles.component}>
        { !this.state.broadcasting && <button type="button" onClick={() => this.startBroadcast()}>Start Broadcast</button> }
      </div>
    )
  }
}
