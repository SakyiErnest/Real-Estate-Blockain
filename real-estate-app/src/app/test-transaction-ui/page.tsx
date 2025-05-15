'use client';

import { useState } from 'react';
import TransactionConfirmation, { TransactionStatus } from '../../components/payment/TransactionConfirmation';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function TestTransactionUIPage() {
    const [status, setStatus] = useState<TransactionStatus>('waiting');
    const [txHash, setTxHash] = useState<string>('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('crypto');

    // Function to cycle through statuses
    const nextStatus = () => {
        if (status === 'waiting') setStatus('processing');
        else if (status === 'processing') setStatus('success');
        else if (status === 'success') setStatus('failed');
        else setStatus('waiting');
    };

    // Function to handle retry
    const handleRetry = () => {
        setStatus('waiting');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Transaction UI Test</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Test the transaction confirmation UI with different statuses and payment methods
                    </p>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Transaction Status Controls
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Use these controls to test different transaction states
                            </p>
                        </div>
                        <div>
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                Current Status: {status}
                            </span>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">
                                    Payment Method
                                </label>
                                <select
                                    id="payment-method"
                                    name="payment-method"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'bank' | 'crypto')}
                                >
                                    <option value="card">Credit Card</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="crypto">Cryptocurrency</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tx-hash" className="block text-sm font-medium text-gray-700">
                                    Transaction Hash
                                </label>
                                <input
                                    type="text"
                                    name="tx-hash"
                                    id="tx-hash"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={nextStatus}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowPathIcon className="mr-2 h-4 w-4" />
                                Next Status
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <TransactionConfirmation
                        status={status}
                        txHash={txHash}
                        onRetry={handleRetry}
                        paymentMethod={paymentMethod}
                    />
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Implementation Details
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <div className="prose max-w-none">
                            <h4>Features Implemented:</h4>
                            <ul>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Step-by-step transaction progress indicators
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Animated progress bar with color-coded status
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Payment method indicators with appropriate icons
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Success animation with confetti effect
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Responsive design for all device sizes
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Accessible UI with proper ARIA attributes
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
