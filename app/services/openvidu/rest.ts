import { OpenVidu } from 'openvidu-node-client';

export const restClient = new OpenVidu(
  `https://${process.env.OPENVIDU_HOST}/`,
  process.env.OPENVIDU_SECRET,
);
