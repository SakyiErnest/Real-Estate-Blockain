'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { connectWallet, processPayment, isMetaMaskInstalled, WalletError, TransactionError } from '../../lib/web3';
import TransactionConfirmation, { TransactionStatus } from './TransactionConfirmation';
import CurrencyConverter from './CurrencyConverter';
import FeeCalculator from './FeeCalculator';
import CryptoPrices from './CryptoPrices';
import MetaMaskGuidance from './MetaMaskGuidance';
import { TransactionFees, CryptoPrice } from '../../lib/currencyService';
import { createTransaction, subscribeToStatusUpdates, unsubscribeFromStatusUpdates } from '../../lib/transactionService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// Fix import path to ensure it's correctly resolved
import AuthModal from '../auth/AuthModal';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function PaymentModal({ isOpen, onClose, property }: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [offerAmount, setOfferAmount] = useState(property.price.toString());
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('waiting');
  const [txHash, setTxHash] = useState('');
  const [isMetaMaskDetected, setIsMetaMaskDetected] = useState<boolean | null>(null);

  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);
  const unsubscribeAuthRef = useRef<() => void | null>(null);
  const transactionInProgressRef = useRef(false);

  // New state for enhanced payment experience
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null);
  const [transactionFees, setTransactionFees] = useState<TransactionFees | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [convertedCurrency, setConvertedCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  // Check for MetaMask and enforce authentication when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Check for MetaMask
      setIsMetaMaskDetected(isMetaMaskInstalled());

      // CRITICAL: Force authentication check when modal opens
      const currentUser = auth.currentUser;
      console.log("PaymentModal opened - Current auth user:", currentUser?.email || "NO USER AUTHENTICATED");

      // If no user is authenticated, force close the payment modal and show auth modal
      if (!currentUser) {
        console.error("SECURITY ALERT: Unauthenticated user attempted to access payment modal");
        setIsAuthModalOpen(true);
        onClose(); // Close the payment modal
      }
    }
  }, [isOpen, onClose]);

  // Monitor authentication state
  useEffect(() => {
    if (isOpen) {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth state changed in PaymentModal:", currentUser ? "User authenticated" : "NO USER");
        setUser(currentUser);

        // If no user is authenticated, force close the payment modal
        if (!currentUser) {
          // If we're in the middle of a transaction, show auth expired message
          if (transactionInProgressRef.current) {
            setAuthExpired(true);
            setIsAuthModalOpen(true);

            // If we're processing a payment, pause it
            if (isProcessing) {
              setError('Your session has expired. Please sign in again to continue.');
              setErrorType('AUTH_EXPIRED');
            }
          } else {
            // Not in a transaction, just close the modal
            console.error("SECURITY ALERT: Unauthenticated user in payment modal");
            setIsAuthModalOpen(true);
            onClose(); // Close the payment modal
          }
        }
      });

      // Store unsubscribe function
      unsubscribeAuthRef.current = unsubscribe;

      return () => {
        // Clean up listener when modal closes
        if (unsubscribeAuthRef.current) {
          unsubscribeAuthRef.current();
        }
      };
    }
  }, [isOpen, isProcessing, onClose]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    setErrorType(null);

    try {
      // Check if MetaMask is installed first
      if (!isMetaMaskDetected) {
        setErrorType('NOT_INSTALLED');
        setError('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        return;
      }

      const address = await connectWallet();
      setWalletAddress(address);
      setStep(2);
    } catch (err: any) {
      console.error('Wallet connection error:', err);

      // Handle structured wallet errors
      if (err.type) {
        const walletError = err as WalletError;
        setErrorType(walletError.type);
        setError(walletError.message);
      } else {
        // Fallback for other errors
        setErrorType('UNKNOWN');
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle refresh after MetaMask installation
  const handleMetaMaskRefresh = () => {
    setIsMetaMaskDetected(isMetaMaskInstalled());
    setError('');
    setErrorType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setErrorType(null);
    setStep(3);
    setTransactionStatus('waiting');

    // Mark that a transaction is in progress (for auth monitoring)
    transactionInProgressRef.current = true;

    try {
      // Validate inputs
      if (!offerAmount || isNaN(parseFloat(offerAmount)) || parseFloat(offerAmount) <= 0) {
        throw new Error('Please enter a valid offer amount greater than 0');
      }

      if (paymentMethod === 'crypto' && !selectedCrypto) {
        throw new Error('Please select a cryptocurrency for payment');
      }

      // In a real app, you would use the actual seller's wallet address
      const sellerAddress = '0x1234567890123456789012345678901234567890';

      // Get current user ID from Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to make an offer');
      }

      // Set up transaction options based on selected cryptocurrency
      const options = selectedCrypto ? {
        currency: selectedCrypto.symbol.toUpperCase() as any,
        // Add estimated gas parameters based on network congestion
        gasLimit: 21000, // Standard ETH transfer gas limit
      } : undefined;

      // Process the payment
      const transaction = await processPayment(offerAmount, sellerAddress, options);

      // Update status to processing
      setTransactionStatus('processing');

      // Store transaction hash
      setTxHash(transaction.transactionHash);

      // Create a transaction record
      if (transaction.transactionHash) {
        try {
          // Create transaction record
          const txRecord = await createTransaction(
            transaction.transactionHash,
            parseFloat(offerAmount),
            selectedCrypto ? selectedCrypto.symbol.toUpperCase() : 'ETH',
            paymentMethod,
            sellerAddress,
            walletAddress,
            transactionFees || {
              processorFee: 0,
              networkFee: 0,
              platformFee: 0,
              totalFee: 0
            },
            property.id,
            property.title,
            selectedCrypto ? parseFloat(calculateCryptoAmount()) : undefined,
            selectedCrypto ? selectedCrypto.symbol.toUpperCase() : undefined
          );

          // Subscribe to transaction status updates
          const unsubscribe = subscribeToStatusUpdates(txRecord.id, (updatedTx) => {
            if (updatedTx.status === 'confirmed') {
              setTransactionStatus('success');
              setSuccess(true);
              unsubscribeFromStatusUpdates(txRecord.id);
            } else if (updatedTx.status === 'failed') {
              setTransactionStatus('failed');
              setError('Transaction failed on the blockchain. Please try again.');
              unsubscribeFromStatusUpdates(txRecord.id);
            } else if (updatedTx.status === 'processing') {
              setTransactionStatus('processing');
            }
          });

          // Simulate a successful transaction after a delay (for demo purposes)
          // In a real app, this would be handled by the blockchain
          setTimeout(() => {
            setTransactionStatus('success');
            setSuccess(true);
          }, 5000);
        } catch (txError) {
          console.error('Error creating transaction record:', txError);
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);

      // Handle structured transaction errors
      if (err.type) {
        const txError = err as TransactionError;
        setErrorType(txError.type);
        setError(txError.message);
      } else {
        // Fallback for other errors
        setError(err.message || 'Failed to process payment');
      }

      setTransactionStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    // Reset status and try again
    setTransactionStatus('waiting');
    setError('');
    setErrorType(null);
    setTxHash('');

    // Create a synthetic event for the form submission
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;

    // Retry the transaction after a short delay
    setTimeout(() => {
      handleSubmit(syntheticEvent);
    }, 500);
  };

  const handleClose = () => {
    setStep(1);
    setOfferAmount(property.price.toString());
    setWalletAddress('');
    setError('');
    setErrorType(null);
    setSuccess(false);
    setTransactionStatus('waiting');
    setTxHash('');
    setPaymentMethod('crypto');
    setSelectedCrypto(null);
    setTransactionFees(null);
    setShowAdvancedOptions(false);
    setAuthExpired(false);
    setIsAuthModalOpen(false);

    // Reset transaction progress flag
    transactionInProgressRef.current = false;

    onClose();
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: 'card' | 'bank' | 'crypto') => {
    setPaymentMethod(method);
    // Reset selected crypto if not crypto payment
    if (method !== 'crypto') {
      setSelectedCrypto(null);
    }
  };

  // Handle fee calculation update
  const handleFeesChange = (fees: TransactionFees) => {
    setTransactionFees(fees);
  };

  // Handle crypto selection
  const handleCryptoSelect = (crypto: CryptoPrice) => {
    setSelectedCrypto(crypto);
  };

  // Handle currency conversion change
  const handleCurrencyChange = (currency: string, amount: number) => {
    setConvertedCurrency(currency);
    setConvertedAmount(amount);
  };

  // Calculate crypto amount based on selected crypto and offer amount
  const calculateCryptoAmount = () => {
    if (selectedCrypto && selectedCrypto.current_price > 0) {
      const amountInUsd = parseFloat(offerAmount);
      if (!isNaN(amountInUsd)) {
        return (amountInUsd / selectedCrypto.current_price).toFixed(8);
      }
    }
    return '0';
  };

  // Handle successful re-authentication
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setAuthExpired(false);
    setError('');
    setErrorType(null);

    // If we were in the middle of a transaction, resume it
    if (transactionInProgressRef.current && transactionStatus === 'failed') {
      handleRetry();
    }
  };

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      {step === 1 && 'Connect Your Wallet'}
                      {step === 2 && 'Make an Offer'}
                      {step === 3 && 'Transaction Status'}
                    </Dialog.Title>

                    {error && step !== 3 && errorType !== 'NOT_INSTALLED' && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="mt-4">
                        {errorType === 'NOT_INSTALLED' ? (
                          <MetaMaskGuidance onRefresh={handleMetaMaskRefresh} />
                        ) : (
                          <>
                            <p className="text-sm text-gray-500">
                              Connect your cryptocurrency wallet to make an offer on this property.
                            </p>
                            <div className="mt-6">
                              <button
                                type="button"
                                className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={handleConnect}
                                disabled={isConnecting}
                              >
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                              </button>
                            </div>
                            {!isMetaMaskDetected && !error && (
                              <div className="mt-4 text-sm text-gray-500">
                                <p className="flex items-center text-amber-600">
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                  MetaMask extension not detected
                                </p>
                                <p className="mt-1">
                                  You'll need to install the MetaMask browser extension to connect your wallet.
                                </p>
                                <button
                                  type="button"
                                  className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium"
                                  onClick={() => {
                                    setErrorType('NOT_INSTALLED');
                                    setError('MetaMask is not installed. Please install MetaMask to connect your wallet.');
                                  }}
                                >
                                  Show installation instructions
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Make an offer for {property.title} located at {property.address}.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                          <div>
                            <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700">
                              Wallet Address
                            </label>
                            <input
                              type="text"
                              id="wallet-address"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={walletAddress}
                              disabled
                            />
                          </div>

                          <div>
                            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">
                              Payment Method
                            </label>
                            <div className="mt-1 grid grid-cols-3 gap-3">
                              <div
                                className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'card' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                  }`}
                                onClick={() => handlePaymentMethodChange('card')}
                              >
                                <span className="text-sm font-medium text-gray-900">Credit Card</span>
                              </div>
                              <div
                                className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'bank' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                  }`}
                                onClick={() => handlePaymentMethodChange('bank')}
                              >
                                <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                              </div>
                              <div
                                className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'crypto' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                  }`}
                                onClick={() => handlePaymentMethodChange('crypto')}
                              >
                                <span className="text-sm font-medium text-gray-900">Cryptocurrency</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="offer-amount" className="block text-sm font-medium text-gray-700">
                              Offer Amount (USD)
                            </label>
                            <input
                              type="text"
                              id="offer-amount"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              required
                            />
                          </div>

                          {/* Display Currency Converter */}
                          <CurrencyConverter
                            amountUSD={parseFloat(offerAmount) || 0}
                            onChange={handleCurrencyChange}
                          />

                          {/* Show transaction fee estimate */}
                          {parseFloat(offerAmount) > 0 && (
                            <FeeCalculator
                              amount={parseFloat(offerAmount)}
                              paymentMethod={paymentMethod}
                              cryptoType={selectedCrypto?.id}
                              onChange={handleFeesChange}
                            />
                          )}

                          {/* Show crypto selector for crypto payments */}
                          {paymentMethod === 'crypto' && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Select Cryptocurrency
                              </h4>

                              <CryptoPrices
                                onSelect={handleCryptoSelect}
                                selectedId={selectedCrypto?.id}
                              />

                              {selectedCrypto && (
                                <div className="mt-4 p-4 rounded-md bg-gray-50">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    Payment Summary with {selectedCrypto.name}
                                  </h5>
                                  <div className="flex justify-between text-sm">
                                    <span>Amount in {selectedCrypto.symbol.toUpperCase()}:</span>
                                    <span className="font-medium">{calculateCryptoAmount()} {selectedCrypto.symbol.toUpperCase()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <button
                              type="submit"
                              className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              disabled={isProcessing || (paymentMethod === 'crypto' && !selectedCrypto)}
                            >
                              {isProcessing ? 'Processing...' : 'Submit Offer'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="mt-4">
                        <TransactionConfirmation
                          status={transactionStatus}
                          txHash={txHash}
                          message={error || undefined}
                          onRetry={handleRetry}
                          paymentMethod={paymentMethod}
                        />

                        {transactionStatus === 'success' && (
                          <div className="mt-6 space-y-4">
                            <div className="rounded-md bg-green-50 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-green-800">Payment successful</h3>
                                  <div className="mt-2 text-sm text-green-700">
                                    <p>Your payment for {property.title} has been processed successfully.</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              onClick={handleClose}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    {/* Auth Modal for handling authentication expiry */}
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onSuccess={handleAuthSuccess}
      initialMode="signin"
    />
    </>
  );
}
