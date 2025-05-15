'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Transaction, subscribeToStatusUpdates, unsubscribeFromStatusUpdates } from '../../lib/transactionService';
import Link from 'next/link';

interface TransactionStatusTrackerProps {
    transactionId: string;
    onStatusChange?: (status: 'pending' | 'confirmed' | 'failed') => void;
    showReceipt?: boolean;
    propertyTitle?: string;
    propertyAddress?: string;
}

export default function TransactionStatusTracker({
    transactionId,
    onStatusChange,
    showReceipt = true,
    propertyTitle,
    propertyAddress
}: TransactionStatusTrackerProps) {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Subscribe to transaction status updates
    useEffect(() => {
        setLoading(true);
        
        // Set up subscription to transaction updates
        const unsubscribe = subscribeToStatusUpdates(
            transactionId,
            (updatedTransaction) => {
                setTransaction(updatedTransaction);
                setLastUpdated(new Date());
                setLoading(false);
                
                if (onStatusChange) {
                    onStatusChange(updatedTransaction.status);
                }
            }
        );
        
        // Cleanup subscription on unmount
        return () => {
            unsubscribeFromStatusUpdates(transactionId);
            if (unsubscribe) unsubscribe();
        };
    }, [transactionId, onStatusChange]);

    // Format date
    const formatDate = (date: Date | null) => {
        if (!date) return 'Never';
        return date.toLocaleTimeString();
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 8 : 2,
        }).format(amount);
    };

    // Get status badge
    const getStatusBadge = () => {
        if (!transaction) return null;
        
        switch (transaction.status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="mr-1 h-4 w-4" />
                        Pending
                        {transaction.confirmations === 0 && (
                            <span className="ml-1 animate-pulse">•••</span>
                        )}
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                        Confirmed
                        {transaction.confirmations && transaction.confirmations > 0 && (
                            <span className="ml-1 text-xs">
                                ({transaction.confirmations} confirmation{transaction.confirmations !== 1 ? 's' : ''})
                            </span>
                        )}
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="mr-1 h-4 w-4" />
                        Failed
                    </span>
                );
            default:
                return null;
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error tracking transaction</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !transaction) {
        return (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 flex justify-center">
                    <div className="flex flex-col items-center">
                        <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
                        <p className="mt-2 text-sm text-gray-500">Loading transaction data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">Transaction not found</h3>
                        <div className="mt-2 text-sm text-gray-700">
                            <p>No data available for transaction ID: {transactionId}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Transaction Status
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Last updated: {formatDate(lastUpdated)}
                    </p>
                </div>
                <div>
                    {getStatusBadge()}
                </div>
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{transaction.id}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{transaction.paymentMethod}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {new Date(transaction.timestamp).toLocaleString()}
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono break-all">
                            {transaction.hash}
                        </dd>
                    </div>
                    {showReceipt && transaction.status === 'confirmed' && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Receipt</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <Link 
                                    href={`/receipt/${transaction.id}`}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    View Receipt
                                </Link>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
