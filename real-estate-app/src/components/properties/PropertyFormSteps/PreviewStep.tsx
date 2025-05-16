'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PropertyFormValues } from '@/lib/validationSchemas';
import { PropertyType } from '@/types/property';

interface PreviewStepProps {
  formData: PropertyFormValues;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const propertyTypeLabels: Record<PropertyType, string> = {
  house: 'House',
  apartment: 'Apartment',
  condo: 'Condominium',
  townhouse: 'Townhouse',
  land: 'Land',
  commercial: 'Commercial',
  other: 'Other',
};

export default function PreviewStep({
  formData,
  onBack,
  onSubmit,
  isSubmitting,
}: PreviewStepProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Create preview URLs for the images on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined' && formData.images && Array.isArray(formData.images)) {
      const urls = Array.from(formData.images).map((file) => URL.createObjectURL(file));
      setImageUrls(urls);

      // Cleanup function to revoke object URLs when component unmounts
      return () => {
        urls.forEach(URL.revokeObjectURL);
      };
    }
  }, [formData.images]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Preview Your Listing</h3>
        <p className="mt-1 text-sm text-gray-500">
          Review your property details before submitting.
        </p>
      </div>

      {/* Image Gallery */}
      {imageUrls.length > 0 && (
        <div>
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
            <Image
              src={imageUrls[currentImageIndex]}
              alt={formData.title}
              width={800}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
          {imageUrls.length > 1 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className={`cursor-pointer overflow-hidden rounded-md ${
                    index === currentImageIndex ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={url}
                    alt={`${formData.title} - Image ${index + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-md bg-white p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900">{formData.title}</h2>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
            {propertyTypeLabels[formData.type]}
          </span>
          <span className="mx-2">•</span>
          <span className="font-medium text-gray-900">${formData.price.toLocaleString()}</span>
        </div>
        <p className="mt-4 text-gray-700">{formData.description}</p>
      </div>

      {/* Location */}
      <div className="rounded-md bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Location</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-500">
          <p>{formData.location.address}</p>
          <p>
            {formData.location.city}, {formData.location.state} {formData.location.zipCode}
          </p>
          <p>{formData.location.country}</p>
        </div>
      </div>

      {/* Features */}
      <div className="rounded-md bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Features</h3>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {formData.features.bedrooms !== undefined && (
            <div>
              <span className="font-medium text-gray-900">Bedrooms:</span>{' '}
              {formData.features.bedrooms}
            </div>
          )}
          {formData.features.bathrooms !== undefined && (
            <div>
              <span className="font-medium text-gray-900">Bathrooms:</span>{' '}
              {formData.features.bathrooms}
            </div>
          )}
          {formData.features.squareFootage !== undefined && (
            <div>
              <span className="font-medium text-gray-900">Square Footage:</span>{' '}
              {formData.features.squareFootage.toLocaleString()} sq ft
            </div>
          )}
          {formData.features.yearBuilt !== undefined && (
            <div>
              <span className="font-medium text-gray-900">Year Built:</span>{' '}
              {formData.features.yearBuilt}
            </div>
          )}
        </div>

        {formData.features.amenities && formData.features.amenities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Amenities</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.features.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Listing'}
        </button>
      </div>
    </div>
  );
}
