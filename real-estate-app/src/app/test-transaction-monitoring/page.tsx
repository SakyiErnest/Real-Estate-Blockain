'use client';

import { useState, useEffect } from 'react';
import TransactionStatusTracker from '../../components/payment/TransactionStatusTracker';
import TransactionReceipt from '../../components/payment/TransactionReceipt';
import { Transaction, createTransaction, getTransaction } from '../../lib/transactionService';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TestTransactionMonitoringPage() {
    const [transactionId, setTransactionId] = useState<string>('');
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    // Create a mock transaction for testing
    const createMockTransaction = () => {
        setLoading(true);
        setError(null);
        
        try {
            // Create a mock transaction
            const mockTransaction = createTransaction(
                '0x' + Math.random().toString(16).substring(2, 34),
                250000,
                'USD',
                'crypto',
                '0x1234567890123456789012345678901234567890',
                '0x0987654321098765432109876543210987654321',
                {
                    processorFee: 0,
                    networkFee: 5,
                    platformFee: 1250,
                    totalFee: 1255
                },
                {
                    propertyId: 'prop-123',
                    propertyTitle: 'Luxury Condo in Downtown',
                    propertyAddress: '123 Main St, New York, NY 10001'
                }
            );
            
            setTransactionId(mockTransaction.id);
            setTransaction(mockTransaction);
        } catch (err: any) {
            setError(err.message || 'Failed to create mock transaction');
        } finally {
            setLoading(false);
        }
    };

    // Load transaction by ID
    const loadTransaction = () => {
        if (!transactionId) {
            setError('Please enter a transaction ID');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const tx = getTransaction(transactionId);
            if (tx) {
                setTransaction(tx);
                setError(null);
            } else {
                setTransaction(null);
                setError('Transaction not found');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load transaction');
            setTransaction(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle transaction status change
    const handleStatusChange = (status: 'pending' | 'confirmed' | 'failed') => {
        console.log(`Transaction status changed to: ${status}`);
        
        // Show receipt when transaction is confirmed
        if (status === 'confirmed') {
            setShowReceipt(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Transaction Monitoring</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Track transaction status and generate receipts
                    </p>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Transaction Controls
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Create a mock transaction or load an existing one
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700">
                                    Transaction ID
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="transaction-id"
                                        id="transaction-id"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                        placeholder="Enter transaction ID"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={loadTransaction}
                                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                                    >
                                        Load
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={createMockTransaction}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Mock Transaction
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="mt-4 flex justify-center">
                                <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {transactionId && (
                    <div className="mb-8">
                        <TransactionStatusTracker
                            transactionId={transactionId}
                            onStatusChange={handleStatusChange}
                            showReceipt={true}
                            propertyTitle="Luxury Condo in Downtown"
                            propertyAddress="123 Main St, New York, NY 10001"
                        />
                    </div>
                )}

                {showReceipt && transaction && (
                    <div className="mb-8">
                        <TransactionReceipt
                            transaction={transaction}
                            propertyTitle="Luxury Condo in Downtown"
                            propertyAddress="123 Main St, New York, NY 10001"
                        />
                    </div>
                )}

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
                                    Real-time transaction status tracking with WebSocket simulation
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Automated receipt generation with print and download options
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Detailed transaction information display
                                </li>
                                <li>
                                    <CheckCircleIcon className="inline-block h-5 w-5 text-green-500 mr-1" />
                                    Status badges with real-time updates
                                </li>
                            </ul>
                            
                            <div className="mt-6">
                                <Link 
                                    href="/test-payment-experience" 
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Back to Payment Experience Demo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
