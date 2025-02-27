import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { requestId } = req.query;

  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  try {
    // Make a GET request to the specified URL to fetch the payment result
    const response = await fetch(`https://api.samfrench.io/tk-callback/${encodeURIComponent(requestId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.API_KEY, // Use environment variable for the API key
      },
    });

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Error response from API:', errorText);
      throw new Error(`Unexpected response format: ${errorText}`);
    }

    const paymentResult = await response.json();

    if (!response.ok) {
      throw new Error(paymentResult.error || 'Failed to fetch payment result');
    }

    res.status(200).json(paymentResult);
  } catch (error) {
    console.error('Error fetching payment result:', error);
    res.status(500).json({ error: 'Error fetching payment result' });
  }
}