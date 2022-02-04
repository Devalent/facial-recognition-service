import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenVidu, OpenViduRole } from 'openvidu-node-client';

const openvidu = new OpenVidu(
  `https://127.0.0.1:8081/`,
  '123',
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        const result = await createSession();
        res.status(200).json({ connection: result.token });
        return;
      default:
        res.status(404).end();
        return;
    }
  } catch (error) {
    console.error(error);

    res.status(500).end();
  }
}

async function createSession() {
  const session = await openvidu.createSession({});
  
  const connection = await session.createConnection({
    role: OpenViduRole.PUBLISHER,
    data: JSON.stringify({}),
  });

  return connection;
}