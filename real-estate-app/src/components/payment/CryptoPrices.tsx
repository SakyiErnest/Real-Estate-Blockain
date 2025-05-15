'use client';

import { useState, useEffect } from 'react';
import { getCryptoPrices, CryptoPrice } from '../../lib/currencyService';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

interface CryptoPricesProps {
    onSelect?: (crypto: CryptoPrice) => void;
    selectedId?: string;
}

export default function CryptoPrices({ onSelect, selectedId }: CryptoPricesProps) {
    const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshInterval, setRefreshInterval] = useState<number | null>(30000); // 30 seconds refresh

    // Format price with commas for thousands and round to 2 decimal places
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Fetch crypto prices on load and at intervals
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setLoading(true);

                // Set a timeout for the entire operation
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Request timed out')), 8000);
                });

                // Race between the actual fetch and the timeout
                const prices = await Promise.race([
                    getCryptoPrices(),
                    timeoutPromise
                ]);

                setCryptoPrices(prices);
                setError(null);
            } catch (err) {
                console.error('Error fetching crypto prices:', err);

                // Only show error if we don't have any prices yet
                if (cryptoPrices.length === 0) {
                    setError('Failed to fetch cryptocurrency prices. Using static data.');

                    // Try to get static prices as fallback
                    try {
                        const fallbackPrices = await getCryptoPrices();
                        if (fallbackPrices && fallbackPrices.length > 0) {
                            setCryptoPrices(fallbackPrices);
                        }
                    } catch (fallbackError) {
                        console.error('Failed to get fallback prices:', fallbackError);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchPrices();

        // Set up interval for refreshing prices
        let interval: NodeJS.Timeout | null = null;
        if (refreshInterval) {
            interval = setInterval(fetchPrices, refreshInterval);
        }

        // Cleanup
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [refreshInterval, cryptoPrices.length]);

    // Handle crypto selection
    const handleSelect = (crypto: CryptoPrice) => {
        if (onSelect) {
            onSelect(crypto);
        }
    };

    return (
        <div className="w-full overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex justify-between">
                    Cryptocurrency Prices
                    <button
                        type="button"
                        onClick={() => setRefreshInterval(refreshInterval ? null : 30000)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        {refreshInterval ? 'Pause Updates' : 'Resume Updates'}
                    </button>
                </h3>

                {loading && cryptoPrices.length === 0 ? (
                    <div className="animate-pulse mt-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="mt-4 text-sm text-red-600">{error}</div>
                ) : (
                    <div className="mt-4 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                                Cryptocurrency
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                Price
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                24h Change
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {cryptoPrices.map((crypto) => (
                                            <tr
                                                key={crypto.id}
                                                className={`hover:bg-gray-50 cursor-pointer ${selectedId === crypto.id ? 'bg-indigo-50' : ''
                                                    }`}
                                                onClick={() => handleSelect(crypto)}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 mr-3">
                                                            {crypto.symbol.toUpperCase()}
                                                        </span>
                                                        {crypto.name}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                                                    {formatPrice(crypto.current_price)}
                                                </td>
                                                <td className={`whitespace-nowrap px-3 py-4 text-sm text-right ${crypto.price_change_percentage_24h >= 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    <div className="flex items-center justify-end">
                                                        {crypto.price_change_percentage_24h >= 0 ? (
                                                            <ArrowUpIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                                        ) : (
                                                            <ArrowDownIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                                        )}
                                                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                    {loading && cryptoPrices.length > 0 && (
                        <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 bg-indigo-600 rounded-full animate-pulse"></div>
                            Updating prices...
                        </div>
                    )}
                    {!loading && (
                        <div>Last updated: {new Date().toLocaleTimeString()}</div>
                    )}
                </div>
            </div>
        </div>
    );
}