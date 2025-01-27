# paymentGateway/paymentGateway/README.md

# Payment Gateway Test Harness

This is a Next.js application named "paymentGateway" that serves as a test harness for a payment gateway. It provides a simple interface to interact with the payment processing functionalities.

## Project Structure

- **pages/**: Contains the application routes.
  - **api/**: Contains API route handlers.
    - **index.ts**: API route for processing payment requests.
  - **index.tsx**: Main entry point for the application.

- **public/**: Directory for static assets (images, fonts, etc.).

- **styles/**: Contains global CSS styles.
  - **globals.css**: Global styles for the application.

- **.env.example**: Template for environment variables.

- **next.config.js**: Configuration file for Next.js.

- **package.json**: npm configuration file.

- **tsconfig.json**: TypeScript configuration file.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd paymentGateway
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template and fill in the required environment variables.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

This application can be used to test various payment gateway functionalities. You can extend the API routes and frontend components as needed to simulate different payment scenarios.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.