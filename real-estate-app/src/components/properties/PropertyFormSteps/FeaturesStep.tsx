'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { featuresSchema, FeaturesFormValues } from '@/lib/validationSchemas';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FeaturesStepProps {
  onNext: (data: FeaturesFormValues) => void;
  onBack: () => void;
  defaultValues?: FeaturesFormValues;
}

// Common amenities for selection
const commonAmenities = [
  'Parking',
  'Pool',
  'Garden',
  'Balcony',
  'Air Conditioning',
  'Heating',
  'Elevator',
  'Gym',
  'Security System',
  'Fireplace',
  'Washer/Dryer',
  'Dishwasher',
  'Furnished',
  'Pet Friendly',
  'Wheelchair Access',
];

export default function FeaturesStep({ onNext, onBack, defaultValues }: FeaturesStepProps) {
  const [customAmenity, setCustomAmenity] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    defaultValues?.features?.amenities || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FeaturesFormValues>({
    resolver: zodResolver(featuresSchema),
    defaultValues: defaultValues || {
      features: {
        bedrooms: undefined,
        bathrooms: undefined,
        squareFootage: undefined,
        yearBuilt: undefined,
        amenities: [],
      },
    },
  });

  // Update form value when amenities change
  const updateAmenities = (amenities: string[]) => {
    setSelectedAmenities(amenities);
    setValue('features.amenities', amenities);
  };

  // Add a custom amenity
  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      const newAmenities = [...selectedAmenities, customAmenity.trim()];
      updateAmenities(newAmenities);
      setCustomAmenity('');
    }
  };

  // Toggle an amenity selection
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      updateAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      updateAmenities([...selectedAmenities, amenity]);
    }
  };

  // Remove an amenity
  const removeAmenity = (amenity: string) => {
    updateAmenities(selectedAmenities.filter((a) => a !== amenity));
  };

  const onSubmit = (data: FeaturesFormValues) => {
    // Ensure amenities are included in the submission
    data.features.amenities = selectedAmenities;
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            min="0"
            {...register('features.bedrooms', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.features?.bedrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.features.bedrooms.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            {...register('features.bathrooms', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.features?.bathrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.features.bathrooms.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700">
            Square Footage/Area
          </label>
          <input
            id="squareFootage"
            type="number"
            min="0"
            {...register('features.squareFootage', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.features?.squareFootage && (
            <p className="mt-1 text-sm text-red-600">{errors.features.squareFootage.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700">
            Year Built
          </label>
          <input
            id="yearBuilt"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            {...register('features.yearBuilt', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.features?.yearBuilt && (
            <p className="mt-1 text-sm text-red-600">{errors.features.yearBuilt.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amenities</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {commonAmenities.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                id={`amenity-${amenity}`}
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="customAmenity" className="block text-sm font-medium text-gray-700">
          Add Custom Amenity
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="customAmenity"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Wine Cellar"
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100"
          >
            Add
          </button>
        </div>
      </div>

      {selectedAmenities.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Selected Amenities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                >
                  <span className="sr-only">Remove {amenity}</span>
                  <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Next: Images'}
        </button>
      </div>
    </form>
  );
}
