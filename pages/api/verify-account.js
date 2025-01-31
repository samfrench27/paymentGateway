export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { username, email } = req.body;
  
      // Replace with your actual API endpoint and logic to get all accounts
      const apiEndpoint = 'https://api.samfrench.io/users';
  
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.API_KEY,
          },
        });
  
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          if (response.ok) {
            // Check if the username or email already exists
            const accountExists = data.some(
              (account) => account.username === username || account.email === email
            );
  
            if (accountExists) {
              res.status(409).json({ message: 'Username or email already exists' });
            } else {
              res.status(200).json({ message: 'Account is available' });
            }
          } else {
            res.status(response.status).json({ message: data.message });
          }
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          console.error('Response text:', responseText);
          res.status(500).json({ message: 'Internal server error', error: jsonError.message });
        }
      } catch (error) {
        console.error('Error verifying account:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }