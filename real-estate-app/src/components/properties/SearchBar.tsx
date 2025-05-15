'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-grow">
          <input
            type="text"
            className="block w-full rounded-l-md border-0 py-3 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search for properties by location, type, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-r-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-1" aria-hidden="true" />
          Search
        </button>
      </form>
    </div>
  );
}
