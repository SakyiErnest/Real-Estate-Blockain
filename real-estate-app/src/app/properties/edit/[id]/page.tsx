'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getProperty } from '@/lib/propertyService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Property } from '@/types/property';
import dynamic from 'next/dynamic';

// Import PropertyForm component dynamically with SSR disabled
const PropertyForm = dynamic(() => import('@/components/properties/PropertyForm'), { ssr: false });

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push(`/auth/signin?redirect=/properties/edit/${params.id}`);
      }
    });

    return () => unsubscribe();
  }, [router, params.id]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user) return;

      try {
        const propertyData = await getProperty(params.id);

        if (!propertyData) {
          setError('Property not found');
          setIsLoading(false);
          return;
        }

        // Check if the current user is the owner
        if (propertyData.ownerId !== user.uid) {
          setError('You do not have permission to edit this property');
          setIsLoading(false);
          return;
        }

        setProperty(propertyData);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to fetch property');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProperty();
    }
  }, [params.id, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/dashboard?tab=properties"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeftIcon className="mr-1 h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Error
            </h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard?tab=properties"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard?tab=properties"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Edit Property
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Update your property listing information.
          </p>
        </div>

        <PropertyForm existingProperty={property} />
      </div>
    </div>
  );
}
