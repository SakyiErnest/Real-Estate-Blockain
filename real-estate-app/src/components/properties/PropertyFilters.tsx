'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';

const filters = [
  {
    id: 'type',
    name: 'Property Type',
    options: [
      { value: 'house', label: 'House' },
      { value: 'apartment', label: 'Apartment' },
      { value: 'condo', label: 'Condo' },
      { value: 'villa', label: 'Villa' },
    ],
  },
  {
    id: 'bedrooms',
    name: 'Bedrooms',
    options: [
      { value: '1', label: '1 Bedroom' },
      { value: '2', label: '2 Bedrooms' },
      { value: '3', label: '3 Bedrooms' },
      { value: '4', label: '4+ Bedrooms' },
    ],
  },
  {
    id: 'price',
    name: 'Price Range',
    options: [
      { value: '0-300000', label: 'Under $300,000' },
      { value: '300000-500000', label: '$300,000 - $500,000' },
      { value: '500000-750000', label: '$500,000 - $750,000' },
      { value: '750000-1000000', label: '$750,000 - $1,000,000' },
      { value: '1000000-', label: 'Over $1,000,000' },
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Get current filter values from URL
  const currentFilters = new Map();
  for (const filter of filters) {
    const value = searchParams.get(filter.id);
    if (value) {
      currentFilters.set(filter.id, value.split(','));
    } else {
      currentFilters.set(filter.id, []);
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string, checked: boolean) => {
    const current = new Set(currentFilters.get(filterId));
    
    if (checked) {
      current.add(value);
    } else {
      current.delete(value);
    }
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (current.size > 0) {
      params.set(filterId, Array.from(current).join(','));
    } else {
      params.delete(filterId);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      {/* Mobile filter dialog */}
      <Transition show={mobileFiltersOpen} as="div">
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
          <div className="fixed inset-0 bg-black bg-opacity-25" />

          <div className="fixed inset-0 z-40 flex">
            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4 border-t border-gray-200">
                {filters.map((section) => (
                  <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                    {({ open }) => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">{section.name}</span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {section.options.map((option, optionIdx) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={currentFilters.get(section.id)?.includes(option.value)}
                                  onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                  className="ml-3 min-w-0 flex-1 text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Filters */}
      <form className="hidden lg:block">
        <h3 className="sr-only">Filters</h3>
        <div className="border-b border-gray-200 py-6">
          <button
            type="button"
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => {
              router.push(pathname);
            }}
          >
            <span>Reset Filters</span>
          </button>
        </div>

        {filters.map((section) => (
          <Disclosure as="div" key={section.id} className="border-b border-gray-200 py-6">
            {({ open }) => (
              <>
                <h3 className="-my-3 flow-root">
                  <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                    <span className="font-medium text-gray-900">{section.name}</span>
                    <span className="ml-6 flex items-center">
                      <ChevronDownIcon
                        className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                        aria-hidden="true"
                      />
                    </span>
                  </Disclosure.Button>
                </h3>
                <Disclosure.Panel className="pt-6">
                  <div className="space-y-4">
                    {section.options.map((option, optionIdx) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`filter-${section.id}-${optionIdx}`}
                          name={`${section.id}[]`}
                          defaultValue={option.value}
                          type="checkbox"
                          defaultChecked={currentFilters.get(section.id)?.includes(option.value)}
                          onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`filter-${section.id}-${optionIdx}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </form>

      {/* Mobile filter button */}
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          className="m-2 ml-4 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <span className="sr-only">Filters</span>
          <FunnelIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
