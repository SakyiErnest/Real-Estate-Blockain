'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Import PropertyForm component dynamically with SSR disabled
const PropertyForm = dynamic(() => import('@/components/properties/PropertyForm'), { ssr: false });

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/signin?redirect=/properties/create');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
            List Your Property
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Fill out the form below to list your property on our marketplace.
          </p>
        </div>

        <PropertyForm />
      </div>
    </div>
  );
}
