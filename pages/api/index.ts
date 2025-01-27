export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      res.status(200).json({ message: 'GET request to the payment gateway API' });
      break;
    case 'POST':
      // Handle payment processing logic here
      res.status(200).json({ message: 'Payment processed successfully' });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}