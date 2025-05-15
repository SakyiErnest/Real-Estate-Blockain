'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Sample pending properties data (in a real app, this would come from an API or database)
const pendingProperties = [
  {
    id: '201',
    title: 'Luxury Penthouse',
    description: 'Stunning 3-bedroom penthouse with panoramic views',
    price: 1200000,
    location: 'Los Angeles, CA',
    bedrooms: 3,
    bathrooms: 3,
    size: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    owner: {
      id: 'user123',
      name: 'John Smith',
      email: 'john@example.com',
    },
    submittedAt: '2023-08-10',
  },
  {
    id: '202',
    title: 'Waterfront Cottage',
    description: 'Charming 2-bedroom cottage with lake access',
    price: 350000,
    location: 'Seattle, WA',
    bedrooms: 2,
    bathrooms: 1,
    size: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2065&q=80',
    owner: {
      id: 'user456',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
    },
    submittedAt: '2023-08-12',
  },
];

// Sample users data (in a real app, this would come from an API or database)
const users = [
  {
    id: 'user123',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user',
    properties: 3,
    joinedAt: '2023-05-15',
  },
  {
    id: 'user456',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'user',
    properties: 1,
    joinedAt: '2023-06-22',
  },
  {
    id: 'user789',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'admin',
    properties: 0,
    joinedAt: '2023-04-10',
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is admin
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            // Redirect non-admin users
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          router.push('/dashboard');
        }
      } else {
        router.push('/auth/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-500">
            Manage properties, users, and site settings.
          </p>
        </div>

        {/* Admin tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Pending Properties
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {/* Pending Properties tab */}
          {activeTab === 'properties' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Properties</h2>
              
              {pendingProperties.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending properties</h3>
                  <p className="mt-1 text-sm text-gray-500">All properties have been reviewed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {pendingProperties.map((property) => (
                    <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="relative h-48">
                        <Image
                          src={property.imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{property.location}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {property.bedrooms} bd | {property.bathrooms} ba | {property.size} sqft
                        </p>
                        <p className="mt-2 text-lg font-medium text-indigo-600">${property.price.toLocaleString()}</p>
                        
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <p className="text-sm text-gray-500">
                            Submitted by: <span className="font-medium">{property.owner.name}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Email: <span className="font-medium">{property.owner.email}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Date: <span className="font-medium">{property.submittedAt}</span>
                          </p>
                        </div>
                        
                        <div className="mt-4 flex space-x-3">
                          <Link
                            href={`/properties/${property.id}`}
                            className="inline-flex flex-1 justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="inline-flex flex-1 justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="inline-flex flex-1 justify-center items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                          >
                            <XMarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Properties
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Joined
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.properties}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.joinedAt}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Site Settings</h2>
              
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">General Settings</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Configure general site settings and preferences.</p>
                  </div>
                  <form className="mt-5 space-y-6">
                    <div>
                      <label htmlFor="site-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Site Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="site-name"
                          id="site-name"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          defaultValue="Real Estate Marketplace"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium leading-6 text-gray-900">
                        Contact Email
                      </label>
                      <div className="mt-2">
                        <input
                          type="email"
                          name="contact-email"
                          id="contact-email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          defaultValue="contact@realestate.com"
                        />
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="property-moderation"
                          name="property-moderation"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor="property-moderation" className="font-medium text-gray-900">
                          Enable Property Moderation
                        </label>
                        <p className="text-gray-500">All new property listings will require admin approval before being published.</p>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
