import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Property, PropertyImage, PropertyFormData } from '@/types/property';
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from './cloudinaryConfig';

// Create a new property
export const createProperty = async (
  propertyData: PropertyFormData,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    // 1. Create property document in Firestore
    const propertyRef = await addDoc(collection(db, 'properties'), {
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      type: propertyData.type,
      status: 'active',
      location: propertyData.location,
      features: propertyData.features,
      images: [], // Will be updated after image upload
      ownerId: userId,
      ownerName: userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Upload images if any
    if (propertyData.images && propertyData.images.length > 0) {
      const uploadedImages = await uploadPropertyImages(
        propertyData.images,
        userId,
        propertyRef.id
      );

      // 3. Update property with image URLs
      await updateDoc(propertyRef, {
        images: uploadedImages
      });
    }

    return propertyRef.id;
  } catch (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property');
  }
};

// Upload property images to Cloudinary (free tier)
export const uploadPropertyImages = async (
  images: File[],
  userId: string,
  propertyId: string
): Promise<PropertyImage[]> => {
  const uploadedImages: PropertyImage[] = [];

  try {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${Date.now()}_${file.name}`;

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', `properties/${userId}/${propertyId}`);

      // Upload to Cloudinary
      const response = await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      // Add to uploaded images array
      uploadedImages.push({
        url: data.secure_url,
        path: data.public_id, // Store public_id for potential deletion later
        fileName: fileName,
        main: i === 0 // First image is the main image
      });
    }

    return uploadedImages;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
};

// Get a property by ID
export const getProperty = async (propertyId: string): Promise<Property | null> => {
  try {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));

    if (!propertyDoc.exists()) {
      return null;
    }

    const data = propertyDoc.data();

    // Convert Firestore timestamps to Date objects
    return {
      id: propertyDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Property;
  } catch (error) {
    console.error('Error getting property:', error);
    throw new Error('Failed to get property');
  }
};

// Get properties by owner ID
export const getUserProperties = async (userId: string): Promise<Property[]> => {
  try {
    const q = query(
      collection(db, 'properties'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Property);
    });

    return properties;
  } catch (error) {
    console.error('Error getting user properties:', error);
    throw new Error('Failed to get user properties');
  }
};

// Update a property
export const updateProperty = async (
  propertyId: string,
  propertyData: Partial<PropertyFormData>,
  newImages?: File[]
): Promise<void> => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Property not found');
    }

    const property = propertyDoc.data();
    const userId = property.ownerId;

    // Prepare update data
    const updateData: any = {
      ...propertyData,
      updatedAt: serverTimestamp()
    };

    // Upload new images if any
    if (newImages && newImages.length > 0) {
      const uploadedImages = await uploadPropertyImages(
        newImages,
        userId,
        propertyId
      );

      // Combine with existing images
      updateData.images = [...(property.images || []), ...uploadedImages];
    }

    // Update property
    await updateDoc(propertyRef, updateData);
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  }
};

// Delete a property
export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Property not found');
    }

    const property = propertyDoc.data();

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        try {
          // Note: To properly delete images from Cloudinary, you would need to use their API
          // with authentication. For simplicity, we're just removing the reference here.
          // In a production app, you might want to implement a server-side function to handle this.
          console.log(`Image would be deleted from Cloudinary: ${image.path}`);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with other images even if one fails
        }
      }
    }

    // Delete property document
    await deleteDoc(propertyRef);
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
};

// Delete a specific image from a property
export const deletePropertyImage = async (
  propertyId: string,
  imagePath: string
): Promise<void> => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Property not found');
    }

    const property = propertyDoc.data();

    // Filter out the image to delete
    const updatedImages = property.images.filter(
      (image: PropertyImage) => image.path !== imagePath
    );

    // Note: To properly delete images from Cloudinary, you would need to use their API
    // with authentication. For simplicity, we're just removing the reference here.
    console.log(`Image would be deleted from Cloudinary: ${imagePath}`);

    // Update property with new images array
    await updateDoc(propertyRef, {
      images: updatedImages,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting property image:', error);
    throw new Error('Failed to delete property image');
  }
};
