'use client';

import { useState, useEffect } from 'react';
import { calculateTransactionFees, TransactionFees } from '../../lib/currencyService';
import { InformationCircleIcon, CreditCardIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

interface FeeCalculatorProps {
    amount: number;
    paymentMethod: 'card' | 'bank' | 'crypto';
    cryptoType?: string;
    onChange?: (fees: TransactionFees) => void;
    showDetailedBreakdown?: boolean;
}

export default function FeeCalculator({
    amount,
    paymentMethod,
    cryptoType,
    onChange,
    showDetailedBreakdown = false
}: FeeCalculatorProps) {
    const [fees, setFees] = useState<TransactionFees | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Format currency to USD
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Format percentage
    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(2)}%`;
    };

    // Calculate fees when inputs change
    useEffect(() => {
        if (amount > 0) {
            const calculatedFees = calculateTransactionFees(amount, paymentMethod, cryptoType);
            setFees(calculatedFees);

            if (onChange) {
                onChange(calculatedFees);
            }
        }
    }, [amount, paymentMethod, cryptoType, onChange]);

    if (!fees) {
        return null;
    }

    // Get fee rates based on payment method
    const getFeeRates = () => {
        switch (paymentMethod) {
            case 'card':
                return {
                    processorFeeRate: 0.029, // 2.9%
                    networkFeeFixed: 0.30, // $0.30
                    platformFeeRate: 0.01 // 1%
                };
            case 'bank':
                return {
                    processorFeeRate: 0.005, // 0.5%
                    networkFeeFixed: 0,
                    platformFeeRate: 0.01 // 1%
                };
            case 'crypto':
                return {
                    processorFeeRate: 0,
                    networkFeeFixed: cryptoType === 'ethereum' ? 10 : (cryptoType === 'bitcoin' ? 2 : 1),
                    platformFeeRate: 0.005 // 0.5%
                };
            default:
                return {
                    processorFeeRate: 0,
                    networkFeeFixed: 0,
                    platformFeeRate: 0.01 // 1%
                };
        }
    };

    const feeRates = getFeeRates();

    // Get tooltip content for each fee type
    const getTooltipContent = (feeType: string) => {
        switch (feeType) {
            case 'processor':
                if (paymentMethod === 'card') {
                    return 'Processor fees are charged by payment processors like Stripe or PayPal for handling credit/debit card transactions. Typically 2.9% + $0.30 per transaction.';
                } else if (paymentMethod === 'bank') {
                    return 'Processor fees for bank transfers are typically lower than card payments, usually around 0.5% of the transaction amount.';
                }
                return 'Fees charged by the payment processor for handling your transaction.';

            case 'network':
                if (paymentMethod === 'crypto') {
                    return 'Network fees (also called gas fees for Ethereum) are paid to miners/validators to process your transaction on the blockchain. These vary based on network congestion.';
                }
                return 'Fixed fees charged by the payment network to process your transaction.';

            case 'platform':
                return 'Platform fees are charged by our service to maintain and improve the platform. These help us provide a secure and reliable service.';

            case 'total':
                return 'The sum of all applicable fees for this transaction.';

            case 'final':
                return 'The total amount you will pay, including the property price and all applicable fees.';

            default:
                return '';
        }
    };

    // Get payment method icon
    const getPaymentMethodIcon = () => {
        switch (paymentMethod) {
            case 'card':
                return <CreditCardIcon className="h-5 w-5 text-indigo-500" />;
            case 'bank':
                return <BanknotesIcon className="h-5 w-5 text-indigo-500" />;
            case 'crypto':
                return (
                    <div className="rounded-full bg-indigo-100 p-1">
                        <svg className="h-3 w-3 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                        </svg>
                    </div>
                );
        }
    };

    // Calculate fee percentage of total amount
    const calculateFeePercentage = (fee: number) => {
        if (amount <= 0) return 0;
        return (fee / amount) * 100;
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Transaction Fee Estimate
                    </h3>
                    {showDetailedBreakdown && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Detailed Breakdown
                        </span>
                    )}
                </div>

                <div className="mt-2">
                    <div className="bg-blue-50 rounded-md p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                <p className="text-sm text-blue-700">
                                    These fees are estimates and may vary at the time of actual payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 border-t border-gray-200">
                    <dl className="divide-y divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Payment Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{formatCurrency(amount)}</dd>
                        </div>

                        <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 flex items-center">
                                <span className="mr-2">{getPaymentMethodIcon()}</span>
                                {paymentMethod === 'card' && 'Credit/Debit Card'}
                                {paymentMethod === 'bank' && 'Bank Transfer'}
                                {paymentMethod === 'crypto' && `Cryptocurrency${cryptoType ? ` (${cryptoType})` : ''}`}
                            </dd>
                        </div>

                        {fees.processorFee > 0 && (
                            <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4 relative">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    Processor Fee
                                    <button
                                        type="button"
                                        className="ml-1 text-gray-400 hover:text-gray-500"
                                        onMouseEnter={() => setActiveTooltip('processor')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        aria-label="Learn more about processor fees"
                                        title="Learn more about processor fees"
                                    >
                                        <QuestionMarkCircleIcon className="h-4 w-4" />
                                    </button>
                                    {activeTooltip === 'processor' && (
                                        <div className="absolute left-0 top-10 z-10 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                            {getTooltipContent('processor')}
                                            {showDetailedBreakdown && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>Rate: {formatPercentage(feeRates.processorFeeRate)}</p>
                                                    {feeRates.networkFeeFixed > 0 && <p>Fixed fee: {formatCurrency(feeRates.networkFeeFixed)}</p>}
                                                    <p>Calculation: {formatCurrency(amount)} × {formatPercentage(feeRates.processorFeeRate)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 flex items-center justify-between">
                                    <span>{formatCurrency(fees.processorFee)}</span>
                                    {showDetailedBreakdown && (
                                        <span className="text-xs text-gray-500">
                                            ({calculateFeePercentage(fees.processorFee).toFixed(2)}% of total)
                                        </span>
                                    )}
                                </dd>
                            </div>
                        )}

                        {fees.networkFee > 0 && (
                            <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4 relative">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    {paymentMethod === 'crypto' ? 'Network/Gas Fee' : 'Network Fee'}
                                    <button
                                        type="button"
                                        className="ml-1 text-gray-400 hover:text-gray-500"
                                        onMouseEnter={() => setActiveTooltip('network')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        aria-label="Learn more about network fees"
                                        title="Learn more about network fees"
                                    >
                                        <QuestionMarkCircleIcon className="h-4 w-4" />
                                    </button>
                                    {activeTooltip === 'network' && (
                                        <div className="absolute left-0 top-10 z-10 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                            {getTooltipContent('network')}
                                            {showDetailedBreakdown && paymentMethod === 'crypto' && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>Estimated gas/network fee: {formatCurrency(feeRates.networkFeeFixed)}</p>
                                                    <p>Note: Actual gas fees may vary based on network congestion at the time of transaction.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 flex items-center justify-between">
                                    <span>{formatCurrency(fees.networkFee)}</span>
                                    {showDetailedBreakdown && (
                                        <span className="text-xs text-gray-500">
                                            (Fixed fee)
                                        </span>
                                    )}
                                </dd>
                            </div>
                        )}

                        <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4 relative">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                Platform Fee
                                <button
                                    type="button"
                                    className="ml-1 text-gray-400 hover:text-gray-500"
                                    onMouseEnter={() => setActiveTooltip('platform')}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                    aria-label="Learn more about platform fees"
                                    title="Learn more about platform fees"
                                >
                                    <QuestionMarkCircleIcon className="h-4 w-4" />
                                </button>
                                {activeTooltip === 'platform' && (
                                    <div className="absolute left-0 top-10 z-10 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                        {getTooltipContent('platform')}
                                        {showDetailedBreakdown && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                <p>Rate: {formatPercentage(feeRates.platformFeeRate)}</p>
                                                <p>Calculation: {formatCurrency(amount)} × {formatPercentage(feeRates.platformFeeRate)}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 flex items-center justify-between">
                                <span>{formatCurrency(fees.platformFee)}</span>
                                {showDetailedBreakdown && (
                                    <span className="text-xs text-gray-500">
                                        ({calculateFeePercentage(fees.platformFee).toFixed(2)}% of total)
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4 relative">
                            <dt className="text-sm font-medium text-gray-700 font-bold flex items-center">
                                Total Fees
                                <button
                                    type="button"
                                    className="ml-1 text-gray-400 hover:text-gray-500"
                                    onMouseEnter={() => setActiveTooltip('total')}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                    aria-label="Learn more about total fees"
                                    title="Learn more about total fees"
                                >
                                    <QuestionMarkCircleIcon className="h-4 w-4" />
                                </button>
                                {activeTooltip === 'total' && (
                                    <div className="absolute left-0 top-10 z-10 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                        {getTooltipContent('total')}
                                    </div>
                                )}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 font-bold flex items-center justify-between">
                                <span>{formatCurrency(fees.totalFee)}</span>
                                {showDetailedBreakdown && (
                                    <span className="text-xs text-gray-500">
                                        ({calculateFeePercentage(fees.totalFee).toFixed(2)}% of total)
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div className="py-4 sm:grid sm:grid-cols-2 sm:gap-4 bg-gray-50 relative">
                            <dt className="text-base font-medium text-gray-900 flex items-center">
                                Final Amount
                                <button
                                    type="button"
                                    className="ml-1 text-gray-400 hover:text-gray-500"
                                    onMouseEnter={() => setActiveTooltip('final')}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                    aria-label="Learn more about final amount"
                                    title="Learn more about final amount"
                                >
                                    <QuestionMarkCircleIcon className="h-4 w-4" />
                                </button>
                                {activeTooltip === 'final' && (
                                    <div className="absolute left-0 top-10 z-10 w-72 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                        {getTooltipContent('final')}
                                    </div>
                                )}
                            </dt>
                            <dd className="mt-1 text-base text-gray-900 sm:mt-0 font-bold">{formatCurrency(fees.finalAmount)}</dd>
                        </div>
                    </dl>
                </div>

                {showDetailedBreakdown && (
                    <div className="mt-4 text-xs text-gray-500">
                        <p>* Fees are calculated based on current rates and may change.</p>
                        <p>* Cryptocurrency network fees can vary significantly based on network congestion.</p>
                    </div>
                )}
            </div>
        </div>
    );
}