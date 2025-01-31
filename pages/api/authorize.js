export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { username, password } = req.body;
  
      // Replace with your actual API endpoint and logic
      const apiEndpoint = 'https://api.samfrench.io/authorize';
      const payload = { username, password };
  
      try {
        console.log('Sending request to API endpoint:', apiEndpoint);
        console.log('Request payload:', payload);
  
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.API_KEY,
          },
          body: JSON.stringify(payload),
        });
  
        const responseText = await response.text();
        console.log('Response text:', responseText);
  
        if (response.ok) {
          const data = JSON.parse(responseText);
          console.log('API response:', data);
          res.status(200).json(data);
        } else {
          console.error('Error response from API:', responseText);
          res.status(response.status).json({ message: responseText });
        }
      } catch (error) {
        console.error('Error during API call:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }