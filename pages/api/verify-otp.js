export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { email, otp } = req.body;
  
      console.log('Verifying OTP for email:', email);
      console.log('Provided OTP:', otp);
      console.log('Stored OTP:', global.otpStore ? global.otpStore[email] : 'No OTP stored');
  
      // Check if the OTP is valid
      if (global.otpStore && global.otpStore[email] === otp) {
        // OTP is valid
        delete global.otpStore[email]; // Remove the OTP after verification
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        // OTP is invalid
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }