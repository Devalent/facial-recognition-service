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
  const middleware = new WebRtcSnapshotter(1000);

  // Find faces in snapshots
  middleware.on('screenshot', async (image) => {
    try {
      const faces = await encodeFaces(image);

      if (faces.length > 0) {
        const crops = await cropFaces(image, faces);

        const items = crops.map((photo, i) => ({ photo, face: faces[i] }));

        // Notify publisher over WebRTC
        await sendSignal(session.sessionId, publisher.connectionId, 'recognition', { items });
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Create watcher WebRTC connection
  const peer = new WebRtcConnection(subscriber, middleware);

  await peer.connect();

  return {
    id: session.sessionId,
    connection: publisher.token,
  };
};
