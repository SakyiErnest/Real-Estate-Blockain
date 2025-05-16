import { z } from 'zod';
import { PropertyType } from '@/types/property';

// Property form validation schema
export const propertyFormSchema = z.object({
  // Step 1: Basic Information
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  price: z.number().positive('Price must be a positive number').min(1, 'Price is required'),
  type: z.enum(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'other'] as const),

  // Step 2: Location
  location: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    country: z.string().min(2, 'Country is required'),
    zipCode: z.string().min(3, 'ZIP/Postal code is required'),
  }),

  // Step 3: Features
  features: z.object({
    bedrooms: z.number().int().nonnegative('Bedrooms must be a non-negative number').optional(),
    bathrooms: z.number().nonnegative('Bathrooms must be a non-negative number').optional(),
    squareFootage: z.number().positive('Square footage must be a positive number').optional(),
    yearBuilt: z.number().int().positive('Year built must be a positive number').optional(),
    amenities: z.array(z.string()).optional(),
  }),

  // Step 4: Images
  // Use any[] for server-side compatibility, validate as File objects only on client
  images: z.any()
    .optional()
    .refine(
      (val) => {
        // Skip validation during server-side rendering
        if (typeof window === 'undefined') return true;

        // Validate as array of File objects on client
        return Array.isArray(val) &&
               val.length >= 1 &&
               val.length <= 10 &&
               val.every(item => item instanceof File);
      },
      {
        message: 'Please upload 1-10 image files',
      }
    ),
});

// Partial schema for each step
export const basicInfoSchema = propertyFormSchema.pick({
  title: true,
  description: true,
  price: true,
  type: true,
});

export const locationSchema = propertyFormSchema.pick({
  location: true,
});

export const featuresSchema = propertyFormSchema.pick({
  features: true,
});

export const imagesSchema = propertyFormSchema.pick({
  images: true,
});

// Types
export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type LocationFormValues = z.infer<typeof locationSchema>;
export type FeaturesFormValues = z.infer<typeof featuresSchema>;
export type ImagesFormValues = z.infer<typeof imagesSchema>;
