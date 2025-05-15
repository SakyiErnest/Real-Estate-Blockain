'use client';

import { useState, useEffect, useRef } from 'react';
import { getExchangeRates, convertCurrency, ExchangeRates } from '../../lib/currencyService';
import { ArrowsRightLeftIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface CurrencyConverterProps {
    amountUSD: number;
    onChange?: (currency: string, amount: number) => void;
    showAllCurrencies?: boolean;
}

export default function CurrencyConverter({
    amountUSD,
    onChange,
    showAllCurrencies = false
}: CurrencyConverterProps) {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [convertedAmount, setConvertedAmount] = useState(amountUSD);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    // List of popular currencies
    const popularCurrencies = [
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
        { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
        { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
        { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
        { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
        { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
        { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
    ];

    // Format currency based on the selected currency code
    const formatCurrency = (value: number, currencyCode: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Fetch exchange rates
    const fetchRates = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedRates = await getExchangeRates();
            setRates(fetchedRates);
            setLastUpdated(new Date());
            return fetchedRates;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch exchange rates');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Set up auto-refresh
    useEffect(() => {
        // Clear any existing timer
        if (autoRefreshTimerRef.current) {
            clearInterval(autoRefreshTimerRef.current);
            autoRefreshTimerRef.current = null;
        }

        // Set up new timer if auto-refresh is enabled
        if (autoRefresh) {
            autoRefreshTimerRef.current = setInterval(() => {
                fetchRates();
            }, 60000); // Refresh every minute
        }

        // Cleanup on unmount
        return () => {
            if (autoRefreshTimerRef.current) {
                clearInterval(autoRefreshTimerRef.current);
            }
        };
    }, [autoRefresh]);

    // Convert the amount when currency changes or amount changes
    useEffect(() => {
        const doConversion = async () => {
            if (amountUSD <= 0) {
                setConvertedAmount(0);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch rates if we don't have them yet
                let currentRates = rates;
                if (!currentRates) {
                    currentRates = await fetchRates();
                    if (!currentRates) return; // Error fetching rates
                }

                // If USD, no conversion needed
                if (selectedCurrency === 'USD') {
                    setConvertedAmount(amountUSD);
                    if (onChange) {
                        onChange(selectedCurrency, amountUSD);
                    }
                    return;
                }

                // Convert using our rates
                const rate = currentRates[selectedCurrency];
                if (!rate) {
                    throw new Error(`Currency ${selectedCurrency} not supported`);
                }

                const converted = amountUSD * rate;
                setConvertedAmount(converted);

                if (onChange) {
                    onChange(selectedCurrency, converted);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to convert currency');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        doConversion();
    }, [amountUSD, selectedCurrency, onChange, rates]);

    // Initial fetch of rates
    useEffect(() => {
        fetchRates();
    }, []);

    // Handle currency selection change
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(e.target.value);
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchRates();
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    // Get the current exchange rate for display
    const getCurrentRate = () => {
        if (!rates || selectedCurrency === 'USD') return null;
        return rates[selectedCurrency];
    };

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Never';
        return lastUpdated.toLocaleTimeString();
    };

    // Get the flag for the selected currency
    const getSelectedCurrencyFlag = () => {
        const currency = popularCurrencies.find(c => c.code === selectedCurrency);
        return currency ? currency.flag : '';
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Real-Time Currency Conversion
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            aria-label="Refresh exchange rates"
                            title="Refresh exchange rates"
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            type="button"
                            onClick={toggleAutoRefresh}
                            aria-label={`${autoRefresh ? 'Disable' : 'Enable'} auto-refresh`}
                            title={`${autoRefresh ? 'Disable' : 'Enable'} auto-refresh`}
                            className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm ${
                                autoRefresh
                                    ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            <span className="sr-only">{autoRefresh ? 'Disable' : 'Enable'} auto-refresh</span>
                            <div className="h-4 w-4 flex items-center justify-center">
                                {autoRefresh ? '✓' : '×'}
                            </div>
                        </button>
                        <div className="relative">
                            <button
                                type="button"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                aria-label="Show exchange rate information"
                                title="Show exchange rate information"
                                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                            {showTooltip && (
                                <div className="absolute right-0 z-10 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-3 text-xs text-gray-700">
                                    <p>Exchange rates last updated: {formatLastUpdated()}</p>
                                    <p className="mt-1">Auto-refresh: {autoRefresh ? 'Enabled (every minute)' : 'Disabled'}</p>
                                    {getCurrentRate() && (
                                        <p className="mt-1">Current rate: 1 USD = {getCurrentRate()} {selectedCurrency}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                            Select Currency
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <select
                                id="currency"
                                name="currency"
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={selectedCurrency}
                                onChange={handleCurrencyChange}
                            >
                                {(showAllCurrencies ? popularCurrencies : popularCurrencies.slice(0, 7)).map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.flag} {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {!showAllCurrencies && popularCurrencies.length > 7 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Showing 7 of {popularCurrencies.length} available currencies
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <label htmlFor="convertedAmount" className="block text-sm font-medium text-gray-700">
                                Converted Amount {getSelectedCurrencyFlag()}
                            </label>
                            {loading && (
                                <span className="text-xs text-gray-500 flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            )}
                        </div>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-50 font-medium">
                                {formatCurrency(convertedAmount, selectedCurrency)}
                            </div>
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}

                        {!error && selectedCurrency !== 'USD' && (
                            <div className="mt-2 flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    Original: {formatCurrency(amountUSD, 'USD')}
                                </p>
                                {getCurrentRate() && (
                                    <p className="text-xs text-gray-500">
                                        Rate: 1 USD = {getCurrentRate()?.toFixed(4)} {selectedCurrency}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}