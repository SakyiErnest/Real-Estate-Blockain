export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  amenities: string[];
}

export type PropertyStatus = 'active' | 'pending' | 'sold';

export type PropertyType = 
  | 'house' 
  | 'apartment' 
  | 'condo' 
  | 'townhouse' 
  | 'land' 
  | 'commercial' 
  | 'other';

export interface PropertyImage {
  url: string;
  path: string; // Storage path
  fileName: string;
  main: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  location: PropertyLocation;
  features: PropertyFeatures;
  images: PropertyImage[];
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    yearBuilt?: number;
    amenities: string[];
  };
  images: File[];
}
