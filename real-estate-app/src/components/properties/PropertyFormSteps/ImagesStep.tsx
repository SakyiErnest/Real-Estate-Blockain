'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { imagesSchema, ImagesFormValues } from '@/lib/validationSchemas';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImagesStepProps {
  onNext: (data: ImagesFormValues) => void;
  onBack: () => void;
  defaultValues?: ImagesFormValues;
}

export default function ImagesStep({ onNext, onBack, defaultValues }: ImagesStepProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(defaultValues?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ImagesFormValues>({
    resolver: zodResolver(imagesSchema),
    defaultValues: defaultValues || {
      images: [],
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > 10) {
      alert('You can upload a maximum of 10 images');
      return;
    }

    // Create preview URLs for the selected files
    const newPreviewUrls: string[] = [];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image`);
        continue;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB size limit`);
        continue;
      }

      newPreviewUrls.push(URL.createObjectURL(file));
      newFiles.push(file);
    }

    // Update state with new files
    setPreviewImages([...previewImages, ...newPreviewUrls]);
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    setValue('images', updatedFiles);
  };

  // Remove a file
  const removeFile = (index: number) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);

    // Remove the file from state
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);

    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setValue('images', newFiles);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: ImagesFormValues) => {
    // Ensure the images array is set correctly
    data.images = uploadedFiles;
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Property Images (3-10 images) *
        </label>
        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
          <div className="space-y-1 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span onClick={triggerFileInput}>Upload images</span>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
        {errors.images && (
          <p className="mt-1 text-sm text-red-600">
            {typeof errors.images.message === 'string' ? errors.images.message : 'Please upload 1-10 image files'}
          </p>
        )}
      </div>

      {previewImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {previewImages.map((src, index) => (
              <div key={index} className="relative">
                <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md">
                  <Image
                    src={src}
                    alt={`Property image ${index + 1}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 bg-indigo-600 px-2 py-1 text-xs font-medium text-white">
                    Main
                  </span>
                )}
              </div>
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
          disabled={isSubmitting || uploadedFiles.length < 1}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Next: Preview'}
        </button>
      </div>
    </form>
  );
}
