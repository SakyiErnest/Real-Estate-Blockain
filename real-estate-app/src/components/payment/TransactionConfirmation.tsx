'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, ClockIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import styles from './TransactionConfirmation.module.css';

export type TransactionStatus = 'waiting' | 'processing' | 'success' | 'failed';

interface TransactionConfirmationProps {
    status: TransactionStatus;
    message?: string;
    txHash?: string;
    onRetry?: () => void;
    paymentMethod?: 'card' | 'bank' | 'crypto';
}

export default function TransactionConfirmation({
    status,
    message,
    txHash,
    onRetry,
    paymentMethod = 'crypto'
}: TransactionConfirmationProps) {
    const [progressWidth, setProgressWidth] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Define the steps in the transaction process
    const steps = [
        { id: 'initiate', name: 'Initiated', status: status === 'waiting' ? 'current' : 'complete' },
        { id: 'process', name: 'Processing', status: status === 'processing' ? 'current' : (status === 'waiting' ? 'upcoming' : 'complete') },
        { id: 'complete', name: 'Completed', status: status === 'success' ? 'complete' : (status === 'failed' ? 'failed' : 'upcoming') },
    ];

    useEffect(() => {
        if (status === 'waiting') {
            setProgressWidth(25);
        } else if (status === 'processing') {
            setProgressWidth(65);
        } else if (status === 'success' || status === 'failed') {
            setProgressWidth(100);

            // Show confetti animation on success
            if (status === 'success') {
                setShowConfetti(true);
                // Hide confetti after 3 seconds
                const timer = setTimeout(() => setShowConfetti(false), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [status]);

    // Get the appropriate progress width CSS class
    const getProgressWidthClass = () => {
        if (progressWidth === 25) return styles.progressWidth25;
        if (progressWidth === 65) return styles.progressWidth65;
        if (progressWidth === 100) return styles.progressWidth100;
        return '';
    };

    const getStatusTitle = () => {
        switch (status) {
            case 'waiting':
                return 'Waiting for confirmation';
            case 'processing':
                return 'Processing transaction';
            case 'success':
                return 'Transaction successful';
            case 'failed':
                return 'Transaction failed';
            default:
                return '';
        }
    };

    const getStatusMessage = () => {
        if (message) return message;

        switch (status) {
            case 'waiting':
                return paymentMethod === 'crypto'
                    ? 'Please confirm this transaction in your wallet'
                    : 'Please wait while we initiate your transaction';
            case 'processing':
                return 'Your transaction is being processed. This may take a moment...';
            case 'success':
                return 'Your transaction has been successfully processed!';
            case 'failed':
                return 'There was an error processing your transaction. Please try again.';
            default:
                return '';
        }
    };

    const getPaymentMethodIcon = () => {
        switch (paymentMethod) {
            case 'card':
                return <CreditCardIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />;
            case 'bank':
                return <BanknotesIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />;
            case 'crypto':
            default:
                return <div className="rounded-full bg-indigo-100 p-1">
                    <svg className="h-3 w-3 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                </div>;
        }
    };

    // Generate confetti pieces with CSS variables
    const generateConfettiPieces = () => {
        if (!showConfetti) return null;

        return [...Array(50)].map((_, i) => {
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 0.5;
            const rotationAngle = Math.random() * 360;
            const colorIndex = Math.floor(Math.random() * 16);
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

            // Create a unique CSS class name for this confetti piece
            const confettiClassName = `confetti-${i}`;

            // Add a style block to the document head with CSS variables for this piece
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .${confettiClassName} {
                    --confetti-size: ${size}px;
                    --confetti-left: ${left}%;
                    --confetti-color: ${colors[colorIndex]};
                    --animation-duration: ${animationDuration}s;
                    --animation-delay: ${delay}s;
                    --rotation-angle: ${rotationAngle}deg;
                }
            `;
            document.head.appendChild(styleElement);

            // We'll handle cleanup in a separate useEffect in the component

            return {
                element: (
                    <div
                        key={i}
                        className={`${styles.confettiPiece} ${styles.confettiAnimation} ${confettiClassName} absolute top-0 rounded-sm`}
                    />
                ),
                styleElement
            };
        });
    };

    // Confetti animation component
    const Confetti = () => {
        // Generate confetti pieces only if showConfetti is true
        const confettiPieces = showConfetti ? generateConfettiPieces() : null;

        // Clean up style elements when component unmounts - always call useEffect
        useEffect(() => {
            // Only perform cleanup if we have confetti pieces
            if (!confettiPieces) return;

            return () => {
                confettiPieces.forEach(piece => {
                    if (piece.styleElement && document.head.contains(piece.styleElement)) {
                        document.head.removeChild(piece.styleElement);
                    }
                });
            };
        }, [confettiPieces]);

        // Return null if no confetti should be shown
        if (!showConfetti) return null;

        return (
            <div className="fixed inset-0 pointer-events-none z-50 flex justify-center items-center">
                <div className="confetti-container">
                    {confettiPieces?.map(piece => piece.element)}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg bg-white">
            {/* Confetti animation for success */}
            <Confetti />

            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2">
                <div
                    className={`${styles.progressBar} ${status === 'failed' ? styles.progressBarFailed : styles.progressBarSuccess} ${getProgressWidthClass()}`}
                />
            </div>

            {/* Step indicator */}
            <nav aria-label="Progress" className="px-6 pt-4">
                <ol role="list" className="flex items-center">
                    {steps.map((step, stepIdx) => (
                        <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                            {step.status === 'complete' ? (
                                <div className="group flex flex-col items-center">
                                    <span className="flex h-9 items-center">
                                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                                            <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                        </span>
                                    </span>
                                    <span className="text-sm font-medium text-indigo-600">{step.name}</span>
                                </div>
                            ) : step.status === 'current' ? (
                                <div className="flex flex-col items-center" aria-current="step">
                                    <span className="flex h-9 items-center" aria-hidden="true">
                                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                        </span>
                                    </span>
                                    <span className="text-sm font-medium text-indigo-600">{step.name}</span>
                                </div>
                            ) : step.status === 'failed' ? (
                                <div className="flex flex-col items-center">
                                    <span className="flex h-9 items-center" aria-hidden="true">
                                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-600 bg-white">
                                            <XCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                                        </span>
                                    </span>
                                    <span className="text-sm font-medium text-red-600">{step.name}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="flex h-9 items-center" aria-hidden="true">
                                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                        </span>
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">{step.name}</span>
                                </div>
                            )}

                            {stepIdx !== steps.length - 1 ? (
                                <div className={`flex-1 h-0.5 ${
                                    step.status === 'complete' ? 'bg-indigo-600' : 'bg-gray-300'
                                }`} />
                            ) : null}
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="p-6">
                {/* Status icon */}
                <div className="flex justify-center mb-4">
                    {status === 'waiting' && (
                        <div className="animate-pulse">
                            <ClockIcon className="h-16 w-16 text-gray-400" aria-hidden="true" />
                        </div>
                    )}
                    {status === 'processing' && (
                        <div className="animate-spin">
                            <ArrowPathIcon className="h-16 w-16 text-indigo-600" aria-hidden="true" />
                        </div>
                    )}
                    {status === 'success' && (
                        <CheckCircleIcon className="h-16 w-16 text-green-500" aria-hidden="true" />
                    )}
                    {status === 'failed' && (
                        <XCircleIcon className="h-16 w-16 text-red-500" aria-hidden="true" />
                    )}
                </div>

                {/* Status title and message */}
                <h3 className="text-xl font-semibold text-center mb-2">{getStatusTitle()}</h3>
                <p className="text-gray-600 text-center mb-4">{getStatusMessage()}</p>

                {/* Payment method indicator */}
                <div className="flex justify-center items-center mb-4">
                    <div className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getPaymentMethodIcon()}
                        <span className="ml-1 capitalize">{paymentMethod} Payment</span>
                    </div>
                </div>

                {/* Transaction hash if available */}
                {txHash && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
                        <p className="text-xs font-mono text-gray-500 break-all">{txHash}</p>
                    </div>
                )}

                {/* Retry button for failed transactions */}
                {status === 'failed' && onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Retry Transaction
                    </button>
                )}
            </div>
        </div>
    );
}