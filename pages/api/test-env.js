export default function handler(req, res) {
    res.status(200).json({
      API_KEY: process.env.API_KEY,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      SES_SOURCE_EMAIL: process.env.SES_SOURCE_EMAIL,
    });
  }