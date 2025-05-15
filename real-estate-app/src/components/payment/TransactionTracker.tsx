'use client';

import { useState, useEffect } from 'react';
import { Transaction, subscribeToStatusUpdates, unsubscribeFromStatusUpdates } from '../../lib/transactionService';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TransactionTrackerProps {
    transaction: Transaction;
    showDetails?: boolean;
    onStatusChange?: (status: 'pending' | 'confirmed' | 'failed') => void;
}

export default function TransactionTracker({
    transaction,
    showDetails = true,
    onStatusChange,
}: TransactionTrackerProps) {
    const [currentTransaction, setCurrentTransaction] = useState<Transaction>(transaction);
    const [isPolling, setIsPolling] = useState(true);

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
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

    // Subscribe to transaction status updates
    useEffect(() => {
        if (transaction.status === 'pending') {
            const unsubscribe = subscribeToStatusUpdates(transaction.id, (updatedTransaction) => {
                setCurrentTransaction(updatedTransaction);

                if (updatedTransaction.status !== 'pending' && onStatusChange) {
                    onStatusChange(updatedTransaction.status);
                }

                if (updatedTransaction.status !== 'pending') {
                    setIsPolling(false);
                }
            });

            // Cleanup subscription on unmount
            return () => {
                unsubscribeFromStatusUpdates(transaction.id);
            };
        }
    }, [transaction.id, transaction.status, onStatusChange]);

    // Get status badge color and text
    const getStatusBadge = () => {
        switch (currentTransaction.status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="mr-1 h-4 w-4" />
                        Pending
                        {isPolling && (
                            <span className="ml-1 h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        )}
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                        Confirmed
                        {currentTransaction.confirmations && currentTransaction.confirmations > 0 && (
                            <span className="ml-1 text-xs">
                                ({currentTransaction.confirmations} confirmation{currentTransaction.confirmations !== 1 ? 's' : ''})
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

    // Hash shortener
    const shortenHash = (hash: string) => {
        if (hash.length > 16) {
            return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
        }
        return hash;
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Transaction {shortenHash(currentTransaction.hash)}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {formatDate(currentTransaction.timestamp)}
                    </p>
                </div>
                <div>
                    {getStatusBadge()}
                </div>
            </div>

            {showDetails && (
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {formatCurrency(currentTransaction.amount, currentTransaction.currency)}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                                {currentTransaction.id}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                                {currentTransaction.hash}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {currentTransaction.paymentMethod}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Sender</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                                {currentTransaction.sender}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                                {currentTransaction.recipient}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Fees</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {formatCurrency(currentTransaction.fees.totalFee, 'USD')}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    );
} 