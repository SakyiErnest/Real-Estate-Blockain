'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import SubmitOfferButton from '@/components/payment/SubmitOfferButton';
import CryptoPrices from '@/components/payment/CryptoPrices';
import TransactionConfirmation, { TransactionStatus } from '../../components/payment/TransactionConfirmation';

// Sample property data
const sampleProperty = {
  id: 'prop-123',
  title: 'Modern Apartment in Downtown',
  price: 250000,
  address: '123 Main St, Anytown, USA',
};

export default function TestPaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // For the original demo component
  const [status, setStatus] = useState<TransactionStatus>('waiting');
  const [txHash, setTxHash] = useState<string>('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const nextStatus = () => {
    if (status === 'waiting') setStatus('processing');
    else if (status === 'processing') setStatus('success');
    else if (status === 'success') setStatus('failed');
    else setStatus('waiting');
  };

  const handleRetry = () => {
    setStatus('waiting');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Payment Page</h1>
          <p className="mt-2 text-lg text-gray-600">
            This page demonstrates the payment functionality for property offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Property Card with Submit Offer Button */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Sample property for testing payment functionality.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 mb-4">
                <div className="w-full h-48 relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Property Image</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{sampleProperty.title}</h3>
              <p className="text-sm text-gray-500">{sampleProperty.address}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">${sampleProperty.price.toLocaleString()}</p>
              <div className="mt-6">
                <SubmitOfferButton property={sampleProperty} size="lg" fullWidth />
              </div>
            </div>
          </div>

          {/* Crypto Prices Component */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <CryptoPrices />
          </div>
        </div>

        {/* Original Transaction Confirmation Demo */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Transaction Confirmation UI Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Status
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    id="transaction-status"
                    name="transaction-status"
                    aria-label="Transaction Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="waiting">Waiting</option>
                    <option value="processing">Processing</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button
                    type="button"
                    onClick={nextStatus}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next Status
                  </button>
                </div>
              </div>
            </div>

            <div>
              <TransactionConfirmation
                status={status}
                txHash={txHash}
                onRetry={handleRetry}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}