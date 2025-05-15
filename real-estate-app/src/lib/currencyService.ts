// Currency conversion service using ExchangeRate-API
// For a production environment, you would use an API key

// Types for currency data
export interface ExchangeRates {
    [currency: string]: number;
}

export interface CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
}

// Cache exchange rates to reduce API calls
let cachedExchangeRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Get exchange rates from USD to other currencies
export const getExchangeRates = async (): Promise<ExchangeRates> => {
    const now = Date.now();

    // Return cached rates if they're less than 1 hour old
    if (cachedExchangeRates && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedExchangeRates;
    }

    try {
        // For demo purposes, we're using the free API without a key
        // In production, use a paid tier with your API key for reliability
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data.rates) {
            cachedExchangeRates = data.rates;
            lastFetchTime = now;
            return data.rates;
        }

        throw new Error('Failed to get exchange rates');
    } catch (error) {
        console.error('Error fetching exchange rates:', error);

        // Fall back to cached rates if available, otherwise use static rates
        if (cachedExchangeRates) {
            return cachedExchangeRates;
        }

        // Return some static exchange rates as fallback
        return {
            EUR: 0.92,
            GBP: 0.79,
            JPY: 151.21,
            CAD: 1.38,
            AUD: 1.53,
        };
    }
};

// Convert amount from USD to target currency
export const convertCurrency = async (
    amountUSD: number,
    targetCurrency: string
): Promise<number> => {
    if (targetCurrency === 'USD') return amountUSD;

    const rates = await getExchangeRates();
    const rate = rates[targetCurrency];

    if (!rate) {
        throw new Error(`Currency ${targetCurrency} not supported`);
    }

    return amountUSD * rate;
};

// Cache crypto prices to reduce API calls
let cachedCryptoPrices: CryptoPrice[] | null = null;
let lastCryptoPriceFetchTime = 0;
const CRYPTO_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get current prices for popular cryptocurrencies
export const getCryptoPrices = async (): Promise<CryptoPrice[]> => {
    const now = Date.now();

    // Return cached prices if they're less than 5 minutes old
    if (cachedCryptoPrices && (now - lastCryptoPriceFetchTime < CRYPTO_CACHE_DURATION)) {
        return cachedCryptoPrices;
    }

    // Static fallback prices - always have these ready
    const staticPrices = [
        {
            id: "bitcoin",
            symbol: "btc",
            name: "Bitcoin",
            current_price: 65000,
            price_change_percentage_24h: 2.5
        },
        {
            id: "ethereum",
            symbol: "eth",
            name: "Ethereum",
            current_price: 3500,
            price_change_percentage_24h: 1.8
        },
        {
            id: "tether",
            symbol: "usdt",
            name: "Tether",
            current_price: 1,
            price_change_percentage_24h: 0.1
        },
        {
            id: "usd-coin",
            symbol: "usdc",
            name: "USD Coin",
            current_price: 1,
            price_change_percentage_24h: 0.05
        },
        {
            id: "binancecoin",
            symbol: "bnb",
            name: "Binance Coin",
            current_price: 650,
            price_change_percentage_24h: 3.2
        }
    ];

    try {
        // Set up a timeout for the fetch operation
        const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
            const controller = new AbortController();
            const { signal } = controller;

            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, { ...options, signal });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };

        // Using CoinGecko public API (no authentication needed for basic usage)
        const response = await fetchWithTimeout(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,usd-coin,binancecoin&order=market_cap_desc',
            {},
            5000 // 5 second timeout
        );

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            cachedCryptoPrices = data;
            lastCryptoPriceFetchTime = now;
            return data;
        }

        throw new Error('Failed to get crypto prices - invalid data format');
    } catch (error) {
        console.error('Error fetching crypto prices:', error);

        // Fall back to cached prices if available
        if (cachedCryptoPrices) {
            console.log('Using cached crypto prices');
            return cachedCryptoPrices;
        }

        // Return static crypto prices as final fallback
        console.log('Using static crypto prices');
        return staticPrices;
    }
};

// Calculate transaction fees based on payment method and amount
export interface TransactionFees {
    processorFee: number;
    networkFee: number;
    platformFee: number;
    totalFee: number;
    finalAmount: number;
}

export const calculateTransactionFees = (
    amount: number,
    paymentMethod: 'card' | 'bank' | 'crypto',
    cryptoType?: string
): TransactionFees => {
    // Default fee rates based on payment method
    let processorFeeRate = 0;
    const networkFeeRate = 0; // Changed to const since it's never reassigned
    let platformFeeRate = 0.01; // 1% platform fee
    let networkFeeFixed = 0;

    switch (paymentMethod) {
        case 'card':
            processorFeeRate = 0.029; // 2.9% for card payments
            networkFeeFixed = 0.30; // $0.30 fixed fee
            break;
        case 'bank':
            processorFeeRate = 0.005; // 0.5% for bank transfers
            break;
        case 'crypto':
            // Different fees based on crypto type
            if (cryptoType === 'ethereum') {
                networkFeeFixed = 10; // $10 estimated gas fee for Ethereum
            } else if (cryptoType === 'bitcoin') {
                networkFeeFixed = 2; // $2 estimated network fee for Bitcoin
            } else {
                networkFeeFixed = 1; // $1 default for other cryptocurrencies
            }
            platformFeeRate = 0.005; // 0.5% for crypto payments
            break;
    }

    // Calculate individual fees
    const processorFee = amount * processorFeeRate;
    const platformFee = amount * platformFeeRate;
    const networkFee = networkFeeFixed;

    // Calculate total fee and final amount
    const totalFee = processorFee + networkFee + platformFee;
    const finalAmount = amount + totalFee;

    return {
        processorFee,
        networkFee,
        platformFee,
        totalFee,
        finalAmount
    };
};