import type { NextApiRequest, NextApiResponse } from 'next';

import { createRoom } from '../../services/openvidu';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        const room = await createRoom();
        res.status(200).json(room);
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
