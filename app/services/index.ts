import { OpenViduRole } from 'openvidu-node-client';

import { WebRtcConnection } from './openvidu/connection';
import { WebRtcSnapshotter } from './openvidu/middleware';
import { restClient, sendSignal } from './openvidu/rest';
import { encodeFaces } from './recognition/encoding';
import { cropFaces } from './recognition/image';

export type Room = {
  id:string;
  connection:string;
};

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
  
  // Take video snapshots every 1000 ms
  const middleware = new WebRtcSnapshotter(5000);

  const processScreenshot = async (image) => {
    middleware.off('screenshot', processScreenshot);

    try {
      const faces = await encodeFaces(image);

      if (faces.length > 0) {
        const crops = await cropFaces(image, faces);

        const response = crops.map((image, i) => ({ ...faces[i], image }));

        // Notify publisher over WebRTC
        try {
          await session.fetch();

          await sendSignal(session.sessionId, publisher.connectionId, 'recognition', response);
        } catch (error) {
          // Stop on session errors
          middleware.dispose();

          throw error;
        }
      }
    } catch (error) {
      console.error(error.message);
    }

    middleware.on('screenshot', processScreenshot);
  };

  // Find faces in snapshots
  middleware.on('screenshot', processScreenshot);

  // Create watcher WebRTC connection
  const peer = new WebRtcConnection(subscriber, middleware);

  try {
    await peer.connect();
  } catch (error) {
    middleware.dispose();

    throw error;
  }

  return {
    id: session.sessionId,
    connection: publisher.token,
  };
};
