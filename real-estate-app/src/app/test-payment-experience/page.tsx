'use client';

import { useState } from 'react';
import CurrencyConverter from '../../components/payment/CurrencyConverter';
import FeeCalculator from '../../components/payment/FeeCalculator';
import CryptoPrices from '../../components/payment/CryptoPrices';
import { TransactionFees, CryptoPrice } from '../../lib/currencyService';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TestPaymentExperiencePage() {
    const [amount, setAmount] = useState<number>(250000);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('crypto');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null);
    const [fees, setFees] = useState<TransactionFees | null>(null);
    const [showDetailedBreakdown, setShowDetailedBreakdown] = useState<boolean>(true);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setAmount(isNaN(value) ? 0 : value);
    };

    const handleCryptoSelect = (crypto: CryptoPrice) => {
        setSelectedCrypto(crypto);
    };

    const handleFeesChange = (fees: TransactionFees) => {
        setFees(fees);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Enhanced Payment Experience
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Test our improved payment features with real-time updates and detailed breakdowns
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/test-transaction-ui"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View Transaction UI Demo
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Settings</h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                Property Price (USD)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={handleAmountChange}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">USD</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Payment Method
                            </label>
                            <div className="mt-1 grid grid-cols-3 gap-3">
                                <div
                                    className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'card' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                        }`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <span className="text-sm font-medium text-gray-900">Credit Card</span>
                                </div>
                                <div
                                    className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'bank' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                        }`}
                                    onClick={() => setPaymentMethod('bank')}
                                >
                                    <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                                </div>
                                <div
                                    className={`col-span-1 cursor-pointer bg-white shadow-sm border rounded-md p-3 text-center ${paymentMethod === 'crypto' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                                        }`}
                                    onClick={() => setPaymentMethod('crypto')}
                                >
                                    <span className="text-sm font-medium text-gray-900">Cryptocurrency</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="detailed-breakdown"
                                    name="detailed-breakdown"
                                    type="checkbox"
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={showDetailedBreakdown}
                                    onChange={(e) => setShowDetailedBreakdown(e.target.checked)}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="detailed-breakdown" className="font-medium text-gray-700">
                                    Show detailed fee breakdown
                                </label>
                                <p className="text-gray-500">See detailed calculations and explanations for all fees</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <CurrencyConverter amountUSD={amount} showAllCurrencies={true} />
                    </div>

                    <div>
                        <FeeCalculator
                            amount={amount}
                            paymentMethod={paymentMethod}
                            cryptoType={selectedCrypto?.id}
                            onChange={handleFeesChange}
                            showDetailedBreakdown={showDetailedBreakdown}
                        />
                    </div>
                </div>

                {paymentMethod === 'crypto' && (
                    <div className="mt-6">
                        <CryptoPrices onSelect={handleCryptoSelect} selectedId={selectedCrypto?.id} />

                        {selectedCrypto && (
                            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Payment with {selectedCrypto.name}
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm font-medium text-gray-500">Current Price</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                                            ${selectedCrypto.current_price.toLocaleString()}
                                        </p>
                                        <p className={`mt-2 text-sm ${selectedCrypto.price_change_percentage_24h >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}>
                                            {selectedCrypto.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                                            {Math.abs(selectedCrypto.price_change_percentage_24h).toFixed(2)}% (24h)
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm font-medium text-gray-500">Equivalent Amount</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                                            {(amount / selectedCrypto.current_price).toFixed(8)} {selectedCrypto.symbol.toUpperCase()}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            1 {selectedCrypto.symbol.toUpperCase()} = ${selectedCrypto.current_price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-12 bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Enhanced Payment Features
                        </h3>
                        <div className="mt-5 border-t border-gray-200">
                            <dl className="divide-y divide-gray-200">
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Real-time Currency Conversion</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>Implemented with auto-refresh and multiple currency support</span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Transaction Fee Estimates</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>Detailed breakdown with tooltips explaining each fee type</span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Real-time Crypto Prices</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>Live cryptocurrency prices with automatic updates</span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-500">Transaction Confirmation UI</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>
                                                Enhanced visual feedback with step indicators and animations.{' '}
                                                <Link href="/test-transaction-ui" className="text-indigo-600 hover:text-indigo-900">
                                                    View demo
                                                </Link>
                                            </span>
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}