import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      res.status(200).json({ connection: '345' });
      return;
    default:
      res.status(404).end();
      return;
  }
}
