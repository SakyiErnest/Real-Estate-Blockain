'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Sample property data (in a real app, this would come from an API or database)
const sampleProperties = [
  {
    id: '1',
    title: 'Modern Luxury Apartment',
    description: 'Spacious 3-bedroom apartment with stunning city views',
    price: 750000,
    location: 'New York, NY',
    bedrooms: 3,
    bathrooms: 2,
    size: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    description: 'Beautiful 4-bedroom house with a large backyard',
    price: 550000,
    location: 'Austin, TX',
    bedrooms: 4,
    bathrooms: 3,
    size: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2075&q=80',
  },
  {
    id: '3',
    title: 'Beachfront Villa',
    description: 'Luxurious 5-bedroom villa with direct beach access',
    price: 1200000,
    location: 'Miami, FL',
    bedrooms: 5,
    bathrooms: 4,
    size: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
  },
];

export default function FeaturedProperties() {
  const [properties, setProperties] = useState(sampleProperties);

  // In a real app, you would fetch properties from an API
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     try {
  //       const response = await fetch('/api/properties/featured');
  //       const data = await response.json();
  //       setProperties(data);
  //     } catch (error) {
  //       console.error('Error fetching properties:', error);
  //     }
  //   };
  //   fetchProperties();
  // }, []);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {properties.map((property) => (
          <div key={property.id} className="group relative">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={property.imageUrl}
                alt={property.title}
                width={500}
                height={300}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  <Link href={`/properties/${property.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {property.title}
                  </Link>
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-1 text-indigo-600" aria-hidden="true" />
                  {property.location}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <HomeIcon className="h-4 w-4 mr-1 text-indigo-600" aria-hidden="true" />
                  {property.bedrooms} bd | {property.bathrooms} ba | {property.size} sqft
                </div>
              </div>
              <p className="text-lg font-medium text-indigo-600 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                {property.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
