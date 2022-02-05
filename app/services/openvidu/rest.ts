import axios from 'axios';
import { OpenVidu } from 'openvidu-node-client';

export const restClient = new OpenVidu(
  `https://${process.env.OPENVIDU_HOST}/`,
  process.env.OPENVIDU_SECRET,
);

export const sendSignal = async (session:string, connection:string, type:string, payload:any) => {
  await axios({
    url: `https://${process.env.OPENVIDU_HOST}/openvidu/api/signal`,
    method: 'POST',
    auth: {
      username: 'OPENVIDUAPP',
      password: process.env.OPENVIDU_SECRET,
    },
    data: {
      session,
      type,
      to: [connection],
      data: JSON.stringify(payload),
    },
  });
};
