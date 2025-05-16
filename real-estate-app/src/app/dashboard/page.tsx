'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PlusIcon, HomeIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';
import { getUserProperties } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';

// We'll fetch real property data from Firebase

// Sample transaction data (in a real app, this would come from an API or database)
const transactions = [
  {
    id: 'txn-001',
    date: '2023-06-15',
    amount: 450000,
    type: 'purchase',
    property: 'Modern Apartment in Downtown',
    status: 'completed',
  },
  {
    id: 'txn-002',
    date: '2023-07-22',
    amount: 2500,
    type: 'deposit',
    property: 'Cozy Suburban Home',
    status: 'pending',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user properties when user is authenticated
  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user) return;

      setPropertiesLoading(true);
      try {
        const properties = await getUserProperties(user.uid);
        setUserProperties(properties);
      } catch (error) {
        console.error('Error fetching user properties:', error);
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchUserProperties();
  }, [user]);

  // Handle property deletion
  const handlePropertyDeleted = () => {
    // Refresh the properties list
    if (user) {
      getUserProperties(user.uid)
        .then(properties => setUserProperties(properties))
        .catch(error => console.error('Error refreshing properties:', error));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-500">
            Welcome back, {user.displayName || 'User'}!
          </p>
        </div>

        {/* Dashboard tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              My Properties
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Transactions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {/* Properties tab */}
          {activeTab === 'properties' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
                <Link
                  href="/properties/create"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Add Property
                </Link>
              </div>

              {propertiesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : userProperties.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <HomeIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No properties yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first property.</p>
                  <div className="mt-6">
                    <Link
                      href="/properties/create"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      Add Property
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onDelete={handlePropertyDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transactions tab */}
          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Your transaction history will appear here.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Transaction ID
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Type
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Property
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {transaction.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.date}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ${transaction.amount.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="capitalize">{transaction.type}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.property}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">{user.displayName || 'User'}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.displayName || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Account created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Last sign in</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => {
                        auth.signOut();
                        router.push('/');
                      }}
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
