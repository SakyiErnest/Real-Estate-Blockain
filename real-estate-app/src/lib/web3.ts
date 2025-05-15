import { ethers } from 'ethers';
import Web3 from 'web3';

// Define ethereum window interface to fix TypeScript errors
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Initialize Web3
export const getWeb3 = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // We are in the browser and metamask is running
    return new Web3(window.ethereum);
  } else {
    // We are on the server OR the user is not running metamask
    const provider = new Web3.providers.HttpProvider(
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-id'
    );
    return new Web3(provider);
  }
};

// Initialize Ethers provider
export const getEthersProvider = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // We are in the browser and metamask is running
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    // We are on the server OR the user is not running metamask
    return new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-id'
    );
  }
};

// Error types for wallet connection
export type WalletError = {
  code: string;
  message: string;
  type: 'NOT_INSTALLED' | 'USER_REJECTED' | 'ALREADY_PROCESSING' | 'UNAUTHORIZED' | 'UNSUPPORTED_CHAIN' | 'UNKNOWN';
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask with enhanced error handling
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    const error: WalletError = {
      code: 'NO_ETHEREUM_PROVIDER',
      message: 'MetaMask is not installed. Please install MetaMask to connect your wallet.',
      type: 'NOT_INSTALLED'
    };
    console.error('MetaMask not installed', error);
    throw error;
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error: any) {
    console.error('Error connecting to MetaMask', error);

    // Format error for better UI handling
    let walletError: WalletError = {
      code: error.code?.toString() || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred while connecting to your wallet.',
      type: 'UNKNOWN'
    };

    // Handle specific MetaMask errors
    if (error.code === 4001) {
      walletError = {
        code: '4001',
        message: 'You rejected the connection request. Please approve the connection to continue.',
        type: 'USER_REJECTED'
      };
    } else if (error.code === -32002) {
      walletError = {
        code: '-32002',
        message: 'A connection request is already pending. Please check your MetaMask extension.',
        type: 'ALREADY_PROCESSING'
      };
    } else if (error.code === -32603) {
      walletError = {
        code: '-32603',
        message: 'MetaMask encountered an internal error. Please try again.',
        type: 'UNKNOWN'
      };
    }

    throw walletError;
  }
};

// Transaction error types
export type TransactionError = {
  code: string;
  message: string;
  type: 'INSUFFICIENT_FUNDS' | 'REJECTED' | 'NETWORK_ERROR' | 'UNKNOWN';
};

// Process payment with enhanced error handling and support for different cryptocurrencies
export const processPayment = async (
  amount: string,
  to: string,
  options?: {
    currency?: 'ETH' | 'BTC' | 'USDT' | 'USDC' | 'BNB';
    gasLimit?: number;
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: number;
  }
) => {
  try {
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw {
        code: 'INVALID_AMOUNT',
        message: 'Please enter a valid amount greater than 0',
        type: 'UNKNOWN'
      } as TransactionError;
    }

    if (!to || !to.startsWith('0x')) {
      throw {
        code: 'INVALID_ADDRESS',
        message: 'Invalid recipient address',
        type: 'UNKNOWN'
      } as TransactionError;
    }

    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      throw {
        code: 'NO_ETHEREUM_PROVIDER',
        message: 'MetaMask is not installed. Please install MetaMask to make payments.',
        type: 'UNKNOWN'
      } as TransactionError;
    }

    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();

    if (!accounts || accounts.length === 0) {
      // Request accounts if not already connected
      try {
        await connectWallet();
        accounts = await web3.eth.getAccounts();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
      }
    }

    const fromAddress = accounts[0];

    // Check balance before sending transaction
    const balance = await web3.eth.getBalance(fromAddress);
    const amountInWei = web3.utils.toWei(amount, 'ether');

    if (BigInt(balance) < BigInt(amountInWei)) {
      throw {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds in your wallet to complete this transaction',
        type: 'INSUFFICIENT_FUNDS'
      } as TransactionError;
    }

    // Prepare transaction parameters
    const txParams: any = {
      from: fromAddress,
      to: to,
      value: amountInWei
    };

    // Add optional parameters if provided
    if (options?.gasLimit) {
      txParams.gas = options.gasLimit;
    }

    if (options?.maxFeePerGas) {
      txParams.maxFeePerGas = web3.utils.toWei(options.maxFeePerGas.toString(), 'gwei');
    }

    if (options?.maxPriorityFeePerGas) {
      txParams.maxPriorityFeePerGas = web3.utils.toWei(options.maxPriorityFeePerGas.toString(), 'gwei');
    }

    // Send transaction
    const transaction = await web3.eth.sendTransaction(txParams);

    // Create a new object with transaction data including hash
    // Web3.js v4+ might store the hash in different properties, so we handle that safely
    const txHash =
      typeof transaction === 'object'
        ? transaction.transactionHash || (transaction as any).hash || ''
        : '';

    return {
      ...transaction,
      transactionHash: txHash,
      amount,
      currency: options?.currency || 'ETH'
    };
  } catch (error: any) {
    console.error('Error processing payment', error);

    // Format error for better UI handling
    let transactionError: TransactionError = {
      code: error.code?.toString() || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred while processing the payment.',
      type: 'UNKNOWN'
    };

    // Handle specific MetaMask/Web3 errors
    if (error.code === 4001) {
      transactionError = {
        code: '4001',
        message: 'You rejected the transaction. Please approve the transaction to continue.',
        type: 'REJECTED'
      };
    } else if (error.message && error.message.includes('insufficient funds')) {
      transactionError = {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds in your wallet to complete this transaction.',
        type: 'INSUFFICIENT_FUNDS'
      };
    } else if (error.message && error.message.includes('network')) {
      transactionError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection and try again.',
        type: 'NETWORK_ERROR'
      };
    }

    throw transactionError;
  }
};
