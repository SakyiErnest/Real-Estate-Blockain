'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { createProperty, updateProperty } from '@/lib/propertyService';
import { PropertyFormValues } from '@/lib/validationSchemas';
import { Property } from '@/types/property';
import dynamic from 'next/dynamic';

// Import form steps dynamically with SSR disabled
const BasicInfoStep = dynamic(() => import('./PropertyFormSteps/BasicInfoStep'), { ssr: false });
const LocationStep = dynamic(() => import('./PropertyFormSteps/LocationStep'), { ssr: false });
const FeaturesStep = dynamic(() => import('./PropertyFormSteps/FeaturesStep'), { ssr: false });
const ImagesStep = dynamic(() => import('./PropertyFormSteps/ImagesStep'), { ssr: false });
const PreviewStep = dynamic(() => import('./PropertyFormSteps/PreviewStep'), { ssr: false });

interface PropertyFormProps {
  existingProperty?: Property; // For editing mode
}

type FormStep = 'basic-info' | 'location' | 'features' | 'images' | 'preview';

export default function PropertyForm({ existingProperty }: PropertyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('basic-info');
  const [formData, setFormData] = useState<Partial<PropertyFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/signin?redirect=/properties/create');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Initialize form data if editing an existing property
  useEffect(() => {
    if (existingProperty) {
      setFormData({
        title: existingProperty.title,
        description: existingProperty.description,
        price: existingProperty.price,
        type: existingProperty.type,
        location: {
          address: existingProperty.location.address,
          city: existingProperty.location.city,
          state: existingProperty.location.state,
          country: existingProperty.location.country,
          zipCode: existingProperty.location.zipCode,
        },
        features: {
          bedrooms: existingProperty.features.bedrooms,
          bathrooms: existingProperty.features.bathrooms,
          squareFootage: existingProperty.features.squareFootage,
          yearBuilt: existingProperty.features.yearBuilt,
          amenities: existingProperty.features.amenities,
        },
        // Can't set images from URLs, they need to be re-uploaded
        images: [],
      });
    }
  }, [existingProperty]);

  // Handle form step navigation
  const handleBasicInfoNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep('location');
  };

  const handleLocationNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep('features');
  };

  const handleFeaturesNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep('images');
  };

  const handleImagesNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep('preview');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'location':
        setCurrentStep('basic-info');
        break;
      case 'features':
        setCurrentStep('location');
        break;
      case 'images':
        setCurrentStep('features');
        break;
      case 'preview':
        setCurrentStep('images');
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit a property');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (existingProperty) {
        // Update existing property
        await updateProperty(
          existingProperty.id,
          formData as PropertyFormValues,
          formData.images
        );
        router.push(`/dashboard?tab=properties`);
      } else {
        // Create new property
        const propertyId = await createProperty(
          formData as PropertyFormValues,
          user.uid,
          user.displayName || 'Unknown User'
        );
        router.push(`/dashboard?tab=properties`);
      }
    } catch (err: any) {
      console.error('Error submitting property:', err);
      setError(err.message || 'Failed to submit property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render progress steps
  const renderProgressSteps = () => {
    const steps = [
      { id: 'basic-info', name: 'Basic Info' },
      { id: 'location', name: 'Location' },
      { id: 'features', name: 'Features' },
      { id: 'images', name: 'Images' },
      { id: 'preview', name: 'Preview' },
    ];

    return (
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.id}
              className={`${
                stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
              } relative`}
            >
              {step.id === currentStep ? (
                <div className="flex items-center" aria-current="step">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                    <span className="text-sm font-medium text-white">{stepIdx + 1}</span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-indigo-600">{step.name}</span>
                </div>
              ) : stepIdx < steps.findIndex((s) => s.id === currentStep) ? (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                    <span className="text-sm font-medium text-white">✓</span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-indigo-600">{step.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                    <span className="text-sm font-medium text-gray-500">{stepIdx + 1}</span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-500">{step.name}</span>
                </div>
              )}

              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute left-0 top-4 -ml-px mt-0.5 h-0.5 w-full ${
                    stepIdx < steps.findIndex((s) => s.id === currentStep)
                      ? 'bg-indigo-600'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <BasicInfoStep
            onNext={handleBasicInfoNext}
            defaultValues={formData as any}
          />
        );
      case 'location':
        return (
          <LocationStep
            onNext={handleLocationNext}
            onBack={handleBack}
            defaultValues={formData as any}
          />
        );
      case 'features':
        return (
          <FeaturesStep
            onNext={handleFeaturesNext}
            onBack={handleBack}
            defaultValues={formData as any}
          />
        );
      case 'images':
        return (
          <ImagesStep
            onNext={handleImagesNext}
            onBack={handleBack}
            defaultValues={formData as any}
          />
        );
      case 'preview':
        return (
          <PreviewStep
            formData={formData as PropertyFormValues}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {existingProperty ? 'Edit Property' : 'Add New Property'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {existingProperty
            ? 'Update your property listing information'
            : 'List your property on our marketplace'}
        </p>
      </div>

      {renderProgressSteps()}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderCurrentStep()}
    </div>
  );
}
