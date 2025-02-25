import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { provider } = req.body;

    if (provider === 'Token.io') {
      const endpoint = 'https://api.samfrench.io/tokenPostAISConsents';
      const payload = {
        resources: [
          'ACCOUNTS',
          'BALANCES',
          'TRANSACTIONS',
          'TRANSFER_DESTINATIONS',
          'FUNDS_CONFIRMATIONS',
          'STANDING_ORDERS',
        ],
        redirect: 'https://www.google.com',
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.API_KEY,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error fetching account information:', error);
        res.status(500).json({ error: 'Error fetching account information' });
      }
    } else {
      res.status(400).json({ error: 'Unsupported provider' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}