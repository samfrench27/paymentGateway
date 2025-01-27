import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json({ message: 'GET request to the payment gateway API' });
      break;
    case 'POST':
      res.status(200).json({ message: 'POST request to the payment gateway API' });
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}