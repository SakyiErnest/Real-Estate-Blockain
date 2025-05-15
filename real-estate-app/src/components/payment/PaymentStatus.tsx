'use client';

import { useState, useEffect } from 'react';
import TransactionConfirmation, { TransactionStatus } from './TransactionConfirmation';

interface PaymentStatusProps {
    txHash: string;
    initialStatus?: TransactionStatus;
    onSuccess?: () => void;
    onFail?: () => void;
    onRetry?: () => void;
    pollingInterval?: number; // in milliseconds
}

export default function PaymentStatus({
    txHash,
    initialStatus = 'processing',
    onSuccess,
    onFail,
    onRetry,
    pollingInterval = 5000,
}: PaymentStatusProps) {
    const [status, setStatus] = useState<TransactionStatus>(initialStatus);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    // Simulating transaction status updates with polling
    // In a real application, you would replace this with actual transaction status checking
    useEffect(() => {
        if (!txHash || status === 'success' || status === 'failed') {
            return;
        }

        let timer: NodeJS.Timeout;
        let retries = 0;
        const maxRetries = 5;

        const checkStatus = async () => {
            try {
                // In a real app, this would be an API call to check transaction status
                // For example:
                // const response = await fetch(`/api/transactions/${txHash}`);
                // const data = await response.json();

                // Mocking API response with random status for demo purposes
                const mockStatuses: TransactionStatus[] = ['processing', 'success', 'failed'];
                const randomStatus = mockStatuses[Math.floor(Math.random() * 3)];

                // For this demo, we'll make it typically succeed after a few checks
                if (retries >= 3 || randomStatus === 'success') {
                    setStatus('success');
                    setMessage('Your payment was processed successfully!');
                    if (onSuccess) onSuccess();
                } else if (randomStatus === 'failed') {
                    setStatus('failed');
                    setError('There was an issue processing your payment. Please try again.');
                    if (onFail) onFail();
                } else {
                    retries++;
                    timer = setTimeout(checkStatus, pollingInterval);
                }
            } catch (err) {
                setStatus('failed');
                setError('Failed to check transaction status');
                if (onFail) onFail();
            }
        };

        timer = setTimeout(checkStatus, pollingInterval);

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [txHash, status, pollingInterval, onSuccess, onFail]);

    // Retry handler
    const handleRetry = () => {
        setStatus('processing');
        setError(undefined);
        if (onRetry) onRetry();
    };

    return (
        <div className="w-full">
            <TransactionConfirmation
                status={status}
                txHash={txHash}
                message={error || message}
                onRetry={handleRetry}
            />
        </div>
    );
} 