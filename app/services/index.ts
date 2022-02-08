import { OpenViduRole } from 'openvidu-node-client';

import config from '../config';

import { WebRtcConnection } from './openvidu/connection';
import { WebRtcSnapshotter } from './openvidu/middleware';
import { restClient, sendSignal } from './openvidu/rest';
import { encodeFaces } from './recognition/encoding';
import { cropFaces } from './recognition/image';

export type Room = {
  id:string;
  connection:string;
};

const RECOGNITION_INTERVAL = Math.round((1 / config.recognition_fps) * 1000);

export const createRoom = async ():Promise<Room> => {
  // Create OpenVidu room
  const session = await restClient.createSession({});
  
  // Create publisher OpenVidu connection
  const publisher = await session.createConnection({
    role: OpenViduRole.PUBLISHER,
    data: JSON.stringify({}),
  });

  // Create watcher OpenVidu connection
  const subscriber = await session.createConnection({
    role: OpenViduRole.SUBSCRIBER,
    data: JSON.stringify({}),
  });
  
  // Take regular video snapshots
  const middleware = new WebRtcSnapshotter(RECOGNITION_INTERVAL);

  let isProcessing = false;
  let isDisposed = false;

  // Find faces in snapshots
  middleware.on('screenshot', async (image) => {
    if (isProcessing || isDisposed) {
      return;
    }

    isProcessing = true;

    try {
      const faces = await encodeFaces(image);

      if (faces.length > 0) {
        const crops = await cropFaces(image, faces);

        const response = crops.map((image, i) => ({ ...faces[i], image }));

        // Notify publisher over WebRTC
        try {
          await session.fetch();

          if (!isDisposed) {
            await sendSignal(session.sessionId, publisher.connectionId, 'recognition', response);
          }
        } catch (error) {
          // Stop on session errors
          middleware.dispose();
          isDisposed = true;

          throw error;
        }
      }
    } catch (error) {
      console.error(error.message);
    }

    isProcessing = false;
  });

  // Create watcher WebRTC connection
  const peer = new WebRtcConnection(subscriber, middleware);

  try {
    await peer.connect();
  } catch (error) {
    middleware.dispose();
    isDisposed = true;

    throw error;
  }

  return {
    id: session.sessionId,
    connection: publisher.token,
  };
};
