import { Suspense } from 'react';
import PropertyList from '../../components/properties/PropertyList';
import SearchBar from '../../components/properties/SearchBar';
import PropertyFilters from '../../components/properties/PropertyFilters';

export const metadata = {
  title: 'Properties | Real Estate Marketplace',
  description: 'Browse our extensive collection of properties for sale and rent',
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Safely handle searchParams
  let search = '';

  // Defensive approach to avoid URL.canParse issues
  if (searchParams) {
    try {
      // Use Object.prototype methods to avoid direct property access
      const hasSearch = Object.prototype.hasOwnProperty.call(searchParams, 'search');
      if (hasSearch) {
        const searchValue = searchParams.search;
        if (typeof searchValue === 'string') {
          search = searchValue;
        }
      }
    } catch (error) {
      console.error('Error handling search params:', error);
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Properties</h1>
        <p className="mt-4 text-lg text-gray-500">
          Browse our extensive collection of properties for sale and rent.
        </p>

        <div className="mt-8">
          <Suspense fallback={<div>Loading search...</div>}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <div className="hidden lg:block">
            <Suspense fallback={<div>Loading filters...</div>}>
              <PropertyFilters />
            </Suspense>
          </div>

          {/* Property list */}
          <div className="lg:col-span-3">
            <PropertyList initialSearch={search} />
          </div>
        </div>
      </div>
    </div>
  );
}
