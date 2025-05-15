// Transaction monitoring service
// Connects to Firebase and provides blockchain transaction tracking

import { doc, collection, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Transaction {
    id: string;
    hash: string;
    status: 'pending' | 'processing' | 'confirmed' | 'failed';
    amount: number;
    currency: string;
    paymentMethod: 'card' | 'bank' | 'crypto';
    timestamp: number;
    confirmations?: number;
    recipient: string;
    sender: string;
    propertyId?: string;
    propertyTitle?: string;
    fees: {
        processorFee: number;
        networkFee: number;
        platformFee: number;
        totalFee: number;
    };
    cryptoAmount?: number;
    cryptoSymbol?: string;
    metadata?: Record<string, any>;
}

// In-memory storage for demo purposes and fallback
// In production, this uses Firebase Firestore
const transactions = new Map<string, Transaction>();

// Generate a unique transaction ID
const generateTransactionId = (): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

// Create a new transaction
export const createTransaction = async (
    hash: string,
    amount: number,
    currency: string,
    paymentMethod: 'card' | 'bank' | 'crypto',
    recipient: string,
    sender: string,
    fees: {
        processorFee: number;
        networkFee: number;
        platformFee: number;
        totalFee: number;
    },
    propertyId?: string,
    propertyTitle?: string,
    cryptoAmount?: number,
    cryptoSymbol?: string,
    metadata?: Record<string, any>
): Promise<Transaction> => {
    try {
        const timestamp = Date.now();
        const id = generateTransactionId();

        const transaction: Omit<Transaction, 'id'> = {
            hash,
            status: 'pending',
            amount,
            currency,
            paymentMethod,
            timestamp,
            confirmations: 0,
            recipient,
            sender,
            propertyId,
            propertyTitle,
            fees,
            cryptoAmount,
            cryptoSymbol,
            metadata
        };

        // Try to save to Firebase first
        try {
            const docRef = await addDoc(collection(db, 'transactions'), transaction);
            const completeTransaction = {
                ...transaction,
                id: docRef.id
            };

            // Also store in memory for fallback
            transactions.set(docRef.id, completeTransaction);

            return completeTransaction;
        } catch (firebaseError) {
            console.error('Firebase save failed, using in-memory fallback:', firebaseError);

            // Fallback to in-memory if Firebase fails
            const fallbackTransaction = {
                ...transaction,
                id
            };

            transactions.set(id, fallbackTransaction);
            return fallbackTransaction;
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
    }
};

// Get transaction by ID
export const getTransaction = async (id: string): Promise<Transaction | undefined> => {
    try {
        // Try to get from Firebase first
        const docRef = doc(db, 'transactions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Transaction;
        }

        // Fallback to in-memory if not found in Firebase
        return transactions.get(id);
    } catch (error) {
        console.error('Error getting transaction from Firebase, using in-memory fallback:', error);
        // Fallback to in-memory if Firebase fails
        return transactions.get(id);
    }
};

// Get transaction by hash
export const getTransactionByHash = async (hash: string): Promise<Transaction | undefined> => {
    try {
        // Try to get from Firebase first
        const q = query(collection(db, 'transactions'), where('hash', '==', hash));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Transaction;
        }

        // Fallback to in-memory if not found in Firebase
        return Array.from(transactions.values()).find(
            transaction => transaction.hash === hash
        );
    } catch (error) {
        console.error('Error getting transaction by hash from Firebase, using in-memory fallback:', error);
        // Fallback to in-memory if Firebase fails
        return Array.from(transactions.values()).find(
            transaction => transaction.hash === hash
        );
    }
};

// Update transaction status
export const updateTransactionStatus = async (
    id: string,
    status: 'pending' | 'processing' | 'confirmed' | 'failed',
    confirmations?: number
): Promise<Transaction | undefined> => {
    try {
        // Try to update in Firebase first
        const docRef = doc(db, 'transactions', id);
        const updateData: any = {
            status,
            ...(confirmations !== undefined ? { confirmations } : {})
        };

        await updateDoc(docRef, updateData);

        // Get the updated transaction
        const updatedTransaction = await getTransaction(id);

        // Also update in-memory cache
        if (updatedTransaction) {
            transactions.set(id, updatedTransaction);
        }

        return updatedTransaction;
    } catch (error) {
        console.error('Error updating transaction in Firebase, using in-memory fallback:', error);

        // Fallback to in-memory if Firebase fails
        const transaction = transactions.get(id);

        if (transaction) {
            transaction.status = status;
            if (confirmations !== undefined) {
                transaction.confirmations = confirmations;
            }
            transactions.set(id, transaction);
        }

        return transaction;
    }
};

// Get all transactions
export const getAllTransactions = async (): Promise<Transaction[]> => {
    try {
        // Try to get from Firebase first
        const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const firebaseTransactions: Transaction[] = [];
        querySnapshot.forEach(doc => {
            firebaseTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        if (firebaseTransactions.length > 0) {
            return firebaseTransactions;
        }

        // Fallback to in-memory if Firebase is empty or fails
        return Array.from(transactions.values());
    } catch (error) {
        console.error('Error getting all transactions from Firebase, using in-memory fallback:', error);
        // Fallback to in-memory if Firebase fails
        return Array.from(transactions.values());
    }
};

// Get user transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
    try {
        // Try to get from Firebase first
        const q = query(
            collection(db, 'transactions'),
            where('sender', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const firebaseTransactions: Transaction[] = [];
        querySnapshot.forEach(doc => {
            firebaseTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        // Fallback to in-memory if Firebase is empty
        if (firebaseTransactions.length === 0) {
            return Array.from(transactions.values())
                .filter(tx => tx.sender === userId)
                .sort((a, b) => b.timestamp - a.timestamp);
        }

        return firebaseTransactions;
    } catch (error) {
        console.error('Error getting user transactions from Firebase, using in-memory fallback:', error);
        // Fallback to in-memory if Firebase fails
        return Array.from(transactions.values())
            .filter(tx => tx.sender === userId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
};

// Check transaction status from blockchain/payment gateway
// In a real app, this would call an external API
export const checkTransactionStatus = async (
    hash: string
): Promise<{ status: 'pending' | 'processing' | 'confirmed' | 'failed', confirmations: number }> => {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, generate a random status with weighted probabilities
    // In a real app, this would be determined by querying the blockchain or payment gateway
    const random = Math.random();
    let status: 'pending' | 'processing' | 'confirmed' | 'failed';

    if (random < 0.1) {
        status = 'failed'; // 10% chance of failure
    } else if (random < 0.3) {
        status = 'pending'; // 20% chance of pending
    } else if (random < 0.5) {
        status = 'processing'; // 20% chance of processing
    } else {
        status = 'confirmed'; // 50% chance of confirmed
    }

    // For confirmed transactions, generate a random number of confirmations
    const confirmations = status === 'confirmed'
        ? Math.floor(Math.random() * 10) + 1
        : 0;

    return {
        status,
        confirmations
    };
};

// WebSocket connection simulation for real-time updates
type StatusUpdateCallback = (transaction: Transaction) => void;
const statusUpdateCallbacks = new Map<string, StatusUpdateCallback>();
const pollingIntervals = new Map<string, NodeJS.Timeout>();

// Register for status updates
export const subscribeToStatusUpdates = (
    transactionId: string,
    callback: StatusUpdateCallback
): () => void => {
    statusUpdateCallbacks.set(transactionId, callback);

    // Clear any existing polling interval for this transaction
    if (pollingIntervals.has(transactionId)) {
        clearInterval(pollingIntervals.get(transactionId)!);
    }

    // Start polling (in a real app, this would be a WebSocket connection)
    const pollingInterval = setInterval(async () => {
        try {
            // Get the latest transaction data
            const transaction = await getTransaction(transactionId);

            if (!transaction) {
                clearInterval(pollingInterval);
                pollingIntervals.delete(transactionId);
                return;
            }

            // If the transaction is already confirmed or failed, stop polling
            if (transaction.status === 'confirmed' || transaction.status === 'failed') {
                clearInterval(pollingInterval);
                pollingIntervals.delete(transactionId);

                // Call the callback one last time with the final status
                const cb = statusUpdateCallbacks.get(transactionId);
                if (cb) {
                    cb(transaction);
                }
                return;
            }

            // Check status from blockchain/payment gateway
            const { status, confirmations } = await checkTransactionStatus(transaction.hash);

            // Update transaction status
            const updatedTransaction = await updateTransactionStatus(
                transactionId,
                status,
                confirmations
            );

            // Call the callback with the updated transaction
            if (updatedTransaction) {
                const cb = statusUpdateCallbacks.get(transactionId);
                if (cb) {
                    cb(updatedTransaction);
                }
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
        }
    }, 5000); // Poll every 5 seconds

    // Store the polling interval
    pollingIntervals.set(transactionId, pollingInterval);

    // Return a cleanup function
    return () => {
        if (pollingIntervals.has(transactionId)) {
            clearInterval(pollingIntervals.get(transactionId)!);
            pollingIntervals.delete(transactionId);
        }
        statusUpdateCallbacks.delete(transactionId);
    };
};

// Unsubscribe from status updates
export const unsubscribeFromStatusUpdates = (transactionId: string): void => {
    if (pollingIntervals.has(transactionId)) {
        clearInterval(pollingIntervals.get(transactionId)!);
        pollingIntervals.delete(transactionId);
    }
    statusUpdateCallbacks.delete(transactionId);
};

// Get property transactions
export const getPropertyTransactions = async (propertyId: string): Promise<Transaction[]> => {
    try {
        // Try to get from Firebase first
        const q = query(
            collection(db, 'transactions'),
            where('propertyId', '==', propertyId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const firebaseTransactions: Transaction[] = [];
        querySnapshot.forEach(doc => {
            firebaseTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        // Fallback to in-memory if Firebase is empty
        if (firebaseTransactions.length === 0) {
            return Array.from(transactions.values())
                .filter(tx => tx.propertyId === propertyId)
                .sort((a, b) => b.timestamp - a.timestamp);
        }

        return firebaseTransactions;
    } catch (error) {
        console.error('Error getting property transactions from Firebase, using in-memory fallback:', error);
        // Fallback to in-memory if Firebase fails
        return Array.from(transactions.values())
            .filter(tx => tx.propertyId === propertyId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
};