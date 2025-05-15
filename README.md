# Real Estate Blockchain Application

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/SakyiErnest/Real-Estate-Blockain)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.7.1-orange)](https://firebase.google.com/)
[![Web3.js](https://img.shields.io/badge/Web3.js-4.16.0-yellow)](https://web3js.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.14.0-purple)](https://docs.ethers.org/)

A modern real estate marketplace with blockchain payment integration, built with Next.js, Firebase, and Web3 technologies. This platform revolutionizes property transactions by leveraging the security, transparency, and efficiency of blockchain technology.

![Real Estate Blockchain Application](https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80)

## Project Overview

This application is a comprehensive real estate platform that enables users to browse properties, make offers, and complete transactions using cryptocurrency. The platform leverages blockchain technology to provide secure, transparent, and efficient property transactions without traditional intermediaries.

### Key Features

- **Property Marketplace**: Advanced search and filtering of real estate listings
- **User Authentication**: Secure email/password and Google Sign-In integration
- **Cryptocurrency Wallet**: Seamless MetaMask wallet connection
- **Blockchain Payments**: Secure Ethereum-based transaction processing
- **Transaction Monitoring**: Real-time status updates and confirmations
- **Currency Conversion**: Live USD to cryptocurrency conversion rates
- **Fee Transparency**: Detailed breakdown of all transaction costs
- **Responsive Design**: Optimized user experience across all devices

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

The blockchain payment system uses Web3.js and Ethers.js to interact with the Ethereum blockchain, providing a secure and transparent transaction experience.

### Technical Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │────▶│  Web3 Provider  │────▶│  Blockchain     │
│  (Next.js)      │     │  (MetaMask)     │     │  (Ethereum)     │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Firebase       │◀───▶│  Transaction    │◀───▶│  Smart Contract │
│  (Data Storage) │     │  Service        │     │  (Optional)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

#### 1. Web3 Integration Layer

- **Web3.js (v4.16.0)**: Primary library for Ethereum blockchain interactions
- **Ethers.js (v6.14.0)**: Alternative provider with enhanced security features
- **Provider Management**: Automatic fallback to HTTP providers when MetaMask is unavailable
- **Network Detection**: Support for multiple Ethereum networks (Mainnet, Testnet)

#### 2. Transaction Processing

- **Gas Optimization**: Dynamic fee calculation based on network congestion
- **Transaction Signing**: Secure client-side signing via MetaMask
- **Error Handling**: Comprehensive error recovery for failed transactions
- **Confirmation Tracking**: Multi-level confirmation monitoring for transaction security

#### 3. Data Management

- **Firebase Integration**: Real-time transaction status updates
- **Offline Support**: Fallback to local storage when Firebase is unavailable
- **Transaction History**: Comprehensive record of all user transactions
- **Data Encryption**: Enhanced security for sensitive transaction data

#### 4. Currency Services

- **Real-time Conversion**: Live exchange rates between USD and cryptocurrencies
- **Multi-currency Support**: ETH, BTC, USDT, USDC, and BNB support
- **Price Feeds**: Integration with CoinGecko API for accurate pricing
- **Fee Calculation**: Transparent breakdown of all transaction costs

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

## Application Workflow

The following diagram illustrates the complete user journey from property browsing to transaction completion:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│  Browse         │────▶│  User           │────▶│  Property       │────▶│  Connect        │
│  Properties     │     │  Authentication │     │  Selection      │     │  Wallet         │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                                                  │
                                                                                  │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │     │                 │
│  Transaction    │◀───▶│  Blockchain     │◀───▶│  Payment        │◀───▶│  Submit         │
│  Confirmation   │     │  Processing     │     │  Details        │     │  Offer          │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### User Flow Screenshots

| Step | Description              | Screenshot                                                                                                                                                                                 |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Property Browsing        | ![Property Browsing](https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80)           |
| 2    | Authentication           | ![Authentication](https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80)           |
| 3    | Wallet Connection        | ![Wallet Connection](https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80)        |
| 4    | Transaction Confirmation | ![Transaction Confirmation](https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80) |

## Troubleshooting

### Common Issues and Solutions

#### 1. MetaMask Connection Issues

- **Symptom**: Unable to connect wallet or "Provider not found" error
- **Solutions**:
  - Ensure MetaMask extension is installed and up to date
  - Verify MetaMask is unlocked and on the correct network
  - Check browser permissions for the MetaMask extension
  - Try refreshing the page or restarting the browser
  - Clear browser cache and cookies

#### 2. Transaction Failures

- **Symptom**: Transaction fails or remains pending indefinitely
- **Solutions**:
  - Verify sufficient ETH balance for transaction amount and gas fees
  - Check network congestion and consider increasing gas price
  - Ensure you're connected to the correct Ethereum network
  - Verify the recipient address is correct and valid
  - Check MetaMask activity log for detailed error messages

#### 3. Authentication Problems

- **Symptom**: Unable to sign in or persistent authentication errors
- **Solutions**:
  - Clear browser cookies and local storage
  - Verify Firebase configuration in environment variables
  - Check if your account email is verified (if required)
  - Try alternative authentication methods (Google Sign-In)
  - Check browser console for specific error messages

#### 4. Payment Processing Issues

- **Symptom**: Payment shows as processing but never completes
- **Solutions**:
  - Check transaction status on Etherscan using the transaction hash
  - Verify network connectivity and try again
  - Check if the transaction was dropped from the mempool
  - Contact support with your transaction details for assistance

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

## Security Considerations

This application implements several security best practices to protect user data and transactions:

- **Secure Authentication**: Firebase Authentication with email verification and Google OAuth
- **Data Encryption**: Sensitive data is encrypted both in transit and at rest
- **Input Validation**: Comprehensive validation using Zod schema validation
- **XSS Protection**: React's built-in XSS protection and content security policies
- **API Security**: Protected API routes with proper authentication checks
- **Wallet Security**: No private keys are ever stored on our servers
- **Transaction Verification**: Multiple validation steps before transaction submission

## Support and Contact

If you encounter any issues or have questions about the application, please reach out through one of the following channels:

- **GitHub Issues**: [Create a new issue](https://github.com/SakyiErnest/Real-Estate-Blockain/issues)
- **Email**: support@realestate-blockchain.com
- **Twitter**: [@RealEstateBlock](https://twitter.com/RealEstateBlock)
- **Discord**: [Join our community](https://discord.gg/realestate-blockchain)

For security-related concerns, please email security@realestate-blockchain.com directly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Real Estate Blockchain. All rights reserved.
