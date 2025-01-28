import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { provider, amountValue, monthlyLimit, yearlyLimit } = req.body;
    const apiKey = process.env.API_KEY;

    // Debug log to verify API key
    console.log('API Key:', apiKey);

    if (!apiKey) {
      return res.status(500).json({ message: 'API key is missing' });
    }

    let endpoint = '';
    switch (provider) {
      case 'Token.io':
        endpoint = 'https://api.samfrench.io/tokenPostVrpConsents';
        break;
      case 'TrueLayer':
        endpoint = 'https://api.samfrench.io/trueLayervrp';
        break;
      case 'Yapily':
        endpoint = 'https://api.samfrench.io/provider3/variable-recurring-payment';
        break;
      default:
        return res.status(400).json({ message: 'Invalid provider' });
    }

    try {
      console.log('Sending request to endpoint:', endpoint);
      console.log('Request payload:', { amountValue, monthlyLimit, yearlyLimit });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': `${apiKey}`,
        },
        body: JSON.stringify({ amountValue, monthlyLimit, yearlyLimit }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', errorText);
        throw new Error(`Failed to fetch redirect URL: ${errorText}`);
      }

      const data = await response.json();
      const redirectURL = data.redirectURL;

      res.status(200).json({ redirectURL });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}