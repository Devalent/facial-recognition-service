import { OpenViduRole } from 'openvidu-node-client';

import { WebRtcConnection } from './connection';
import { WebRtcSnapshotter } from './middleware';
import { restClient } from './rest';

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
  
  // Take regular video snapshots
  const middleware = new WebRtcSnapshotter();

  middleware.on('screenshot', (data) => {
    console.log(data);
  })

  // Create watcher WebRTC connection
  const peer = new WebRtcConnection(subscriber, middleware);

  await peer.connect();

  return {
    id: session.sessionId,
    connection: publisher.token,
  };
};
