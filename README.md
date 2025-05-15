# Real Estate Blockchain Application

A modern real estate marketplace with blockchain payment integration, built with Next.js, Firebase, and Web3 technologies.

![Real Estate Blockchain Application](https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80)

## Project Overview

This application is a comprehensive real estate platform that enables users to browse properties, make offers, and complete transactions using cryptocurrency. The platform leverages blockchain technology to provide secure, transparent, and efficient property transactions.

### Key Features

- Property browsing and filtering
- User authentication (email/password and Google Sign-In)
- Cryptocurrency wallet integration (primarily MetaMask)
- Blockchain payment processing
- Transaction monitoring and status updates
- Real-time currency conversion
- Detailed fee breakdowns
- Responsive design for all devices

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.18.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher) or [Yarn](https://yarnpkg.com/) (v1.22.0 or higher)
- [Git](https://git-scm.com/)

### Browser Extensions

- [MetaMask](https://metamask.io/download/) - Required for cryptocurrency transactions

## Installation

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/real-estate-blockchain-app.git
cd real-estate-blockchain-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Ethereum Configuration
NEXT_PUBLIC_ETHEREUM_RPC_URL=your_ethereum_rpc_url
```

## Running the Application

### Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Authentication Setup

### Firebase Authentication

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in the Authentication section
3. Set up the Firebase configuration in your `.env.local` file

### Google Sign-In Configuration

1. In the Firebase Console, go to Authentication > Sign-in method
2. Enable Google as a sign-in provider
3. Configure the OAuth consent screen and add authorized domains

## Wallet Connection Setup

The application primarily uses MetaMask for wallet connections. Users will need to:

1. Install the MetaMask browser extension
2. Create or import a wallet
3. Connect their wallet to the application when prompted

For users without MetaMask, the application provides guidance on installation and setup.

## Payment System Integration

The blockchain payment system uses Web3.js and Ethers.js to interact with the Ethereum blockchain. Key components include:

- Wallet connection via MetaMask
- Transaction processing with gas optimization
- Real-time transaction status monitoring
- Fee calculation and transparency
- Currency conversion between USD and cryptocurrencies

## Testing

### Running Tests

```bash
npm run test
# or
yarn test
```

### Test Payment Experience

The application includes test pages for trying out the payment experience without making actual transactions:

- `/test-payment` - Basic payment flow
- `/test-payment-experience` - Enhanced payment UI
- `/test-transaction-monitoring` - Transaction status tracking

## Deployment

### Vercel Deployment

The easiest way to deploy the application is using [Vercel](https://vercel.com/):

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

### Manual Deployment

For other hosting providers:

1. Build the application: `npm run build`
2. Deploy the `.next` folder and supporting files
3. Configure environment variables on your hosting platform

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check if you're connected to the correct network

2. **Transaction Failures**
   - Verify you have sufficient funds for the transaction and gas fees
   - Check network congestion and adjust gas settings if necessary

3. **Authentication Problems**
   - Clear browser cookies and try again
   - Verify Firebase configuration in environment variables

## Project Structure

```
real-estate-app/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # User dashboard
│   │   ├── properties/      # Property listings
│   │   ├── test-payment/    # Test payment pages
│   │   └── ...
│   ├── components/          # React components
│   │   ├── auth/            # Authentication components
│   │   ├── layout/          # Layout components
│   │   ├── payment/         # Payment-related components
│   │   ├── properties/      # Property-related components
│   │   └── ...
│   ├── lib/                 # Utility functions and services
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── web3.ts          # Web3 and blockchain utilities
│   │   ├── currencyService.ts # Currency conversion
│   │   ├── transactionService.ts # Transaction handling
│   │   └── ...
│   └── ...
├── .env.local               # Environment variables (not in repo)
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
