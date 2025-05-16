'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormValues } from '@/lib/validationSchemas';

interface LocationStepProps {
  onNext: (data: LocationFormValues) => void;
  onBack: () => void;
  defaultValues?: LocationFormValues;
}

export default function LocationStep({ onNext, onBack, defaultValues }: LocationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultValues || {
      location: {
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Street Address *
        </label>
        <input
          id="address"
          type="text"
          {...register('location.address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 123 Main St"
        />
        {errors.location?.address && (
          <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            id="city"
            type="text"
            {...register('location.city')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., New York"
          />
          {errors.location?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State/Province *
          </label>
          <input
            id="state"
            type="text"
            {...register('location.state')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., NY"
          />
          {errors.location?.state && (
            <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <input
            id="country"
            type="text"
            {...register('location.country')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., United States"
          />
          {errors.location?.country && (
            <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP/Postal Code *
          </label>
          <input
            id="zipCode"
            type="text"
            {...register('location.zipCode')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., 10001"
          />
          {errors.location?.zipCode && (
            <p className="mt-1 text-sm text-red-600">{errors.location.zipCode.message}</p>
          )}
        </div>
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
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Next: Features'}
        </button>
      </div>
    </form>
  );
}
