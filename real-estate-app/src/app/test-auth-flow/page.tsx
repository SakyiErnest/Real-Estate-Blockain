'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SubmitOfferButton from '@/components/payment/SubmitOfferButton';

// Sample property data
const sampleProperty = {
  id: 'prop-123',
  title: 'Modern Apartment in Downtown',
  price: 250000,
  address: '123 Main St, Anytown, USA',
};

export default function TestAuthFlowPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLogs, setAuthLogs] = useState<string[]>([]);

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    setAuthLogs(prev => [logEntry, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  useEffect(() => {
    addLog("Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        addLog(`User authenticated: ${currentUser.email}`);
      } else {
        addLog("No user authenticated");
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      addLog("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      addLog("Signing out user");
      await signOut(auth);
      addLog("User signed out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      addLog(`Error signing out: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Authentication Flow Test
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            This page tests the authentication flow for making offers
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Authentication Status</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current user authentication information
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {user ? (
              <div>
                <p className="text-green-600 font-medium">
                  Signed in as: {user.displayName || user.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  You are signed in. You should be able to make an offer without seeing the authentication modal.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-medium">Not signed in</p>
                <Link
                  href="/auth/signin"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Sign In Page
                </Link>
                <p className="mt-4 text-sm text-gray-500">
                  You are not signed in. When you click "Submit Offer" below, you should see an authentication modal.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">{sampleProperty.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{sampleProperty.address}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${sampleProperty.price.toLocaleString()}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Property ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {sampleProperty.id}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Actions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <SubmitOfferButton property={sampleProperty} size="lg" />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Authentication Logs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Authentication Logs</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Real-time logs of authentication events
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6 max-h-64 overflow-y-auto bg-gray-50 font-mono text-sm">
              {authLogs.length > 0 ? (
                <ul className="space-y-1">
                  {authLogs.map((log, index) => (
                    <li key={index} className="text-gray-800">{log}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No logs yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
