import { Connection as OpenViduConnection } from 'openvidu-node-client';
import Deferred from 'promise-deferred';
import { RTCPeerConnection } from 'wrtc';

import { OpenViduWsClient } from './ws';

const TIME_TO_CONNECTED = 20000;
const TIME_TO_HOST_CANDIDATES = 10000;
const TIME_TO_RECONNECTED = 10000;

export interface ConnectionMiddleware {
  use(peerConnection:RTCPeerConnection):void;
}

export class WebRtcConnection {
  readonly id:string;

  private readonly ws:OpenViduWsClient;
  private readonly peerConnection;

  private connectionTimer:NodeJS.Timer;
  private reconnectionTimer:NodeJS.Timer;
  private pingInterval:NodeJS.Timer;
  private onIceConnectionStateChange;

  constructor(
    private readonly conn:OpenViduConnection,
    private readonly middleware:ConnectionMiddleware,
  ) {
    this.id = conn.connectionId;
    
    this.ws = new OpenViduWsClient(conn);

    this.peerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan',
    });

    // Connection timeout handling
    let connectionTimer = setTimeout(() => {
      if (this.peerConnection.iceConnectionState !== 'connected' && this.peerConnection.iceConnectionState !== 'completed') {
        this.close();
      }
    }, TIME_TO_CONNECTED);

    let reconnectionTimer = undefined;

    this.onIceConnectionStateChange = () => {
      if (this.peerConnection.iceConnectionState === 'connected' || this.peerConnection.iceConnectionState === 'completed') {
        if (connectionTimer) {
          clearTimeout(connectionTimer);
          connectionTimer = undefined;
        }

        clearTimeout(reconnectionTimer);
        reconnectionTimer = undefined;
      } else if (this.peerConnection.iceConnectionState === 'disconnected' || this.peerConnection.iceConnectionState === 'failed') {
        if (!connectionTimer && !reconnectionTimer) {
          reconnectionTimer = setTimeout(() => {
            this.close();
          }, TIME_TO_RECONNECTED);
        }
      }
    };

    this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);
  }

  async connect() {
    // Send OpenVidu pings
    await this.ws.request('ping', { interval: 5000 });

    this.pingInterval = setInterval(() => {
      this.ws.request('ping').catch(() => {});
    }, 3000);

    // Ask to join OpenVidu room
    const resp = await this.ws.request('joinRoom', {
      token: this.conn.token,
      session: this.ws.sessionId,
      platform: 'Mozilla/5.0',
      metadata: JSON.stringify({}),
      secret: '',
      recorder: false,
    });

    const stream = resp.value?.[0]?.streams?.[0];

    if (stream) {
      // Participant is already publishing
      await this.processOffer(stream['id']);
    } else {
      // Wait for participant to start publishing
      this.ws.on('notification', (payload) => {
        switch (payload.method) {
          case 'participantPublished':
            const newStream = payload.params?.['streams']?.[0];

            if (newStream) {
              this.processOffer(newStream['id']);
            }
            break;
        }
      });
    }

    this.ws.on('notification', (payload) => {
      switch (payload.method) {
        case 'iceCandidate':
          this.peerConnection.addIceCandidate({
            candidate: payload.params?.['candidate'],
            sdpMid: payload.params?.['sdpMid'],
            sdpMLineIndex: payload.params?.['sdpMLineIndex'],
          });
          break;
      }
    });
  }

  async close() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }

    this.peerConnection.removeEventListener('iceconnectionstatechange', this.onIceConnectionStateChange);

    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = undefined;
    }

    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = undefined;
    }

    try {
      this.peerConnection.close();
    } catch (err) {}

    try {
      await this.ws.dispose();
    } catch (err) {}
  }

  private async processOffer(streamId:string) {
    this.middleware.use(this.peerConnection);

    const offer = await this.peerConnection.createOffer();

    await this.peerConnection.setLocalDescription(offer);

    try {
      const resp = await this.ws.request('receiveVideoFrom', {
        sender: streamId,
        sdpOffer: offer.sdp,
      });

      this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: resp.sdpAnswer,
      });

      if (this.peerConnection.iceGatheringState !== 'complete') {
        const deferred = new Deferred();

        const onIceCandidate = (res) => {
          if (!res.candidate) {
            clearTimeout(timeout);
            deferred.resolve();
          }
        }

        const timeout = setTimeout(() => {
          deferred.reject(new Error('Timed out waiting for host candidates'));
        }, TIME_TO_HOST_CANDIDATES);

        this.peerConnection.addEventListener('icecandidate', onIceCandidate);
      
        try {
          await deferred.promise;
        } finally {
          this.peerConnection.removeEventListener('icecandidate', onIceCandidate);
        }
      }
    } catch (error) {
      this.close();

      throw error;
    }
  }
}
