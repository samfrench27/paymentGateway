import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { fromEnv } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';

// Load environment variables and override existing ones
dotenv.config({ override: true });

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export default async function handler(req, res) {
  console.log('Handler invoked');
  console.log('AWS_REGION inside handler:', process.env.AWS_REGION);
  console.log('SES_SOURCE_EMAIL inside handler:', process.env.SES_SOURCE_EMAIL);

  if (req.method === 'POST') {
    const { email } = req.body;

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP in a temporary storage (e.g., in-memory, Redis, etc.)
    // For simplicity, we'll use an in-memory store here
    // In production, use a more persistent storage
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = otp;

    // Log the stored OTP
    console.log('Storing OTP for email:', email);
    console.log('Stored OTP:', global.otpStore[email]);

    const params = {
      Source: process.env.SES_SOURCE_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Your OTP Code',
        },
        Body: {
          Text: {
            Data: `Your OTP code is: ${otp}`,
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await sesClient.send(command);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}