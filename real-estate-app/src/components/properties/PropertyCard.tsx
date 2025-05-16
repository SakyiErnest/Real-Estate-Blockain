'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { Property, PropertyStatus } from '@/types/property';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { deleteProperty } from '@/lib/propertyService';

interface PropertyCardProps {
  property: Property;
  onDelete: () => void;
}

const statusColors: Record<PropertyStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  sold: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteProperty(property.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get main image or placeholder
  const mainImage = property.images && property.images.length > 0
    ? property.images.find(img => img.main)?.url || property.images[0].url
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="relative h-48">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusColors[property.status].bg
            } ${statusColors[property.status].text}`}
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <MapPinIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate">{property.location.city}, {property.location.state}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <CurrencyDollarIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="font-medium">${property.price.toLocaleString()}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <HomeIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span>
            {property.features.bedrooms || 0} bd • {property.features.bathrooms || 0} ba • {property.features.squareFootage?.toLocaleString() || 0} sqft
          </span>
        </div>
        <div className="mt-4 flex space-x-2">
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <EyeIcon className="mr-1 h-4 w-4" aria-hidden="true" />
            View
          </Link>
          <Link
            href={`/properties/edit/${property.id}`}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <PencilIcon className="mr-1 h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
          >
            <TrashIcon className="mr-1 h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteConfirm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isDeleting && setShowDeleteConfirm(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Delete Property
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete this property? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
