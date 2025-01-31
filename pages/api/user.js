import { parseCookies } from 'nookies';
import axios from 'axios';

export default async (req, res) => {
  const cookies = parseCookies({ req });
  const userId = cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Replace this URL with the actual URL of the external API
    const externalApiUrl = `https://api.samfrench.io/users/${userId}`;

    // Call the external API to fetch user data
    const response = await axios.get(externalApiUrl, {
      headers: {
        'X-API-KEY': process.env.API_KEY, // Use the appropriate authorization method
      },
    });

    const user = response.data;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profile_photo: user.profile_photo,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    console.error('Error fetching user data:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error fetching user data', error: error.response ? error.response.data : error.message });
  }
};