'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import PaymentModal from '../../../components/payment/PaymentModal';

// Sample property data (in a real app, this would come from an API or database)
const properties = [
  {
    id: '1',
    title: 'Modern Luxury Apartment',
    description: 'Spacious 3-bedroom apartment with stunning city views. This beautiful apartment features high ceilings, floor-to-ceiling windows, and a modern open-concept layout. The kitchen is equipped with high-end stainless steel appliances, quartz countertops, and custom cabinetry. The master bedroom includes a walk-in closet and an en-suite bathroom with a soaking tub and separate shower. Additional amenities include in-unit laundry, central air conditioning, and a private balcony with panoramic city views.',
    price: 750000,
    location: 'New York, NY',
    address: '123 Park Avenue, New York, NY 10022',
    bedrooms: 3,
    bathrooms: 2,
    size: 1500,
    yearBuilt: 2018,
    propertyType: 'Apartment',
    features: [
      'Hardwood floors',
      'Central air conditioning',
      'In-unit laundry',
      'Stainless steel appliances',
      'Quartz countertops',
      'Walk-in closet',
      'Private balcony',
      'Floor-to-ceiling windows',
      '24-hour doorman',
      'Fitness center',
    ],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    ],
    coordinates: {
      latitude: 40.7580,
      longitude: -73.9855,
    },
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    description: 'Beautiful 4-bedroom house with a large backyard. This charming family home is situated in a quiet, family-friendly neighborhood with excellent schools nearby. The spacious living room features a fireplace and opens to a formal dining area. The updated kitchen includes granite countertops, a center island, and plenty of cabinet space. The master suite offers a walk-in closet and a renovated bathroom. The fenced backyard includes a covered patio, perfect for outdoor entertaining, and a well-maintained lawn with mature trees.',
    price: 550000,
    location: 'Austin, TX',
    address: '456 Oak Street, Austin, TX 78701',
    bedrooms: 4,
    bathrooms: 3,
    size: 2200,
    yearBuilt: 2005,
    propertyType: 'House',
    features: [
      'Hardwood floors',
      'Fireplace',
      'Granite countertops',
      'Center island kitchen',
      'Walk-in closet',
      'Fenced backyard',
      'Covered patio',
      'Two-car garage',
      'Central heating and cooling',
      'Sprinkler system',
    ],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2075&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2053&q=80',
    ],
    coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },
  {
    id: '3',
    title: 'Beachfront Villa',
    description: 'Luxurious 5-bedroom villa with direct beach access. This stunning beachfront property offers breathtaking ocean views from nearly every room. The open floor plan features high ceilings, large windows, and sliding glass doors that lead to an expansive terrace overlooking the beach. The gourmet kitchen is equipped with top-of-the-line appliances, custom cabinetry, and a large center island. The master suite includes a private balcony, a spa-like bathroom with a jetted tub, and a spacious walk-in closet. Additional amenities include a private pool, outdoor kitchen, and direct beach access.',
    price: 1200000,
    location: 'Miami, FL',
    address: '789 Ocean Drive, Miami, FL 33139',
    bedrooms: 5,
    bathrooms: 4,
    size: 3500,
    yearBuilt: 2015,
    propertyType: 'Villa',
    features: [
      'Ocean views',
      'Private pool',
      'Outdoor kitchen',
      'Direct beach access',
      'Gourmet kitchen',
      'High ceilings',
      'Private balcony',
      'Spa-like bathroom',
      'Walk-in closet',
      'Smart home technology',
    ],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    ],
    coordinates: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
  },
];

export default function PropertyDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const propertyId = params.id;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the property data from an API
    // const fetchProperty = async () => {
    //   try {
    //     const response = await fetch(`/api/properties/${propertyId}`);
    //     const data = await response.json();
    //     setProperty(data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching property:', error);
    //     setLoading(false);
    //   }
    // };
    // fetchProperty();

    // For demo purposes, we'll use the sample data
    const foundProperty = properties.find((p) => p.id === propertyId);
    setProperty(foundProperty || null);
    setLoading(false);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">Property Not Found</h1>
          <p className="mt-4 text-lg text-gray-500">The property you are looking for does not exist.</p>
          <div className="mt-8">
            <Link
              href="/properties"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/properties"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" aria-hidden="true" />
            Back to Properties
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Image gallery */}
          <div className="relative">
            <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                width={800}
                height={600}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {property.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className={`aspect-h-1 aspect-w-1 overflow-hidden rounded-lg cursor-pointer ${currentImageIndex === index ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property details */}
          <div className="mt-10 lg:mt-0 lg:pl-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{property.title}</h1>

            <div className="mt-2 flex items-center">
              <MapPinIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              <p className="ml-2 text-lg text-gray-700">{property.address}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Price</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">${property.price.toLocaleString()}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <p className="ml-2 text-gray-700">{property.bedrooms} Bedrooms</p>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <p className="ml-2 text-gray-700">{property.bathrooms} Bathrooms</p>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <p className="ml-2 text-gray-700">{property.size} sqft</p>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <p className="ml-2 text-gray-700">Built in {property.yearBuilt}</p>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <p className="ml-2 text-gray-700">{property.propertyType}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-700">{property.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Features</h2>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                {property.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                type="button"
                className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Make an Offer
              </button>
            </div>
          </div>
        </div>

        {/* Location section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Location</h2>
          <div className="mt-4 p-6 bg-gray-100 rounded-lg">
            <div className="flex items-center">
              <MapPinIcon className="h-6 w-6 text-indigo-600 mr-2" aria-hidden="true" />
              <p className="text-lg text-gray-700">{property.address}</p>
            </div>
            <p className="mt-4 text-gray-600">Map integration will be added later.</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        property={property}
      />
    </div>
  );
}
