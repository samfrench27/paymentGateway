import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import axios from 'axios';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import { setCookie } from 'nookies';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for direct upload to S3
});

const uploadMiddleware = upload.single('profilePhoto');

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we're using multer
  },
};

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }

  try {
    await runMiddleware(req, res, uploadMiddleware);

    const { username, email, password, firstName, lastName } = req.body;
    let profilePhotoUrl = '';

    if (req.file) {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${uuidv4()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      profilePhotoUrl = uploadResult.Location;
    }

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const payload = {
      username,
      email,
      password,
      profile_photo: profilePhotoUrl,
      first_name: firstName,
      last_name: lastName,
    };

    console.log('Sending request to API endpoint: https://api.samfrench.io/users');
    console.log('Request payload:', payload);

    try {
      const response = await axios.post('https://api.samfrench.io/users', payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.API_KEY,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status === 201) {
        const userId = response.data.userid; // Ensure this matches the actual response field

        // Generate a session ID
        const sessionId = crypto.randomBytes(16).toString('hex');

        // Store the session ID and userId in cookies
        setCookie({ res }, 'sessionId', sessionId, {
          httpOnly: true,
          path: '/',
          maxAge: 3600, // 1 hour
        });

        setCookie({ res }, 'userId', userId, {
          httpOnly: true,
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        res.status(201).json({ message: 'User created successfully.', data: response.data });
      } else {
        console.error('Error response from external API:', response.data);
        res.status(response.status).json({ message: response.data.message });
      }
    } catch (error) {
      console.error('Error response from external API:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Error occurred while creating user', error: error.response ? error.response.data : error.message });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error occurred while creating user' });
  }
};