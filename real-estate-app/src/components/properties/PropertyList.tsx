'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Sample property data (in a real app, this would come from an API or database)
const allProperties = [
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
    type: 'apartment',
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
    type: 'house',
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
    type: 'villa',
  },
  {
    id: '4',
    title: 'Downtown Loft',
    description: 'Stylish 1-bedroom loft in the heart of the city',
    price: 420000,
    location: 'Chicago, IL',
    bedrooms: 1,
    bathrooms: 1,
    size: 950,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    type: 'apartment',
  },
  {
    id: '5',
    title: 'Mountain Retreat',
    description: 'Cozy 3-bedroom cabin with breathtaking mountain views',
    price: 380000,
    location: 'Denver, CO',
    bedrooms: 3,
    bathrooms: 2,
    size: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2065&q=80',
    type: 'house',
  },
  {
    id: '6',
    title: 'Waterfront Condo',
    description: 'Modern 2-bedroom condo with stunning water views',
    price: 620000,
    location: 'Seattle, WA',
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    type: 'apartment',
  },
];

interface PropertyListProps {
  initialSearch?: string;
}

export default function PropertyList({ initialSearch = '' }: PropertyListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [properties, setProperties] = useState(allProperties);

  // Filter properties based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = allProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProperties(filtered);
    } else {
      setProperties(allProperties);
    }
  }, [searchTerm]);

  // In a real app, you would fetch properties from an API
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     try {
  //       const response = await fetch(`/api/properties?search=${searchTerm}`);
  //       const data = await response.json();
  //       setProperties(data);
  //     } catch (error) {
  //       console.error('Error fetching properties:', error);
  //     }
  //   };
  //   fetchProperties();
  // }, [searchTerm]);

  return (
    <div>
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 xl:gap-x-8">
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
                  <p className="mt-1 text-sm text-gray-500">{property.description}</p>
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
      )}
    </div>
  );
}
