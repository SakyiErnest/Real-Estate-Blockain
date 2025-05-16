# Setting Up Cloudinary for Image Storage

This document explains how to set up Cloudinary as a free alternative to Firebase Storage for handling property images in the Real Estate Blockchain application.

## Why Cloudinary?

Cloudinary offers a generous free tier that includes:
- 25GB of storage
- 25GB of monthly bandwidth
- Basic transformations and optimizations
- No credit card required

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary's website](https://cloudinary.com/) and sign up for a free account
2. Verify your email address

### 2. Get Your Cloudinary Credentials

After signing in to your Cloudinary dashboard:

1. Note your **Cloud Name** from the dashboard
2. Go to Settings > Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Create a new unsigned upload preset:
   - Name it `real_estate_app` (or choose your own name)
   - Set "Signing Mode" to "Unsigned"
   - Under "Folder", you can specify a base folder like `real-estate-app/`
   - Save the preset

### 3. Configure Environment Variables

Create or update your `.env.local` file in the root of the project with the following variables:

```
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=real_estate_app
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

Replace `your_cloud_name` with your actual Cloudinary cloud name and `your_api_key` with your API key (found in the dashboard).

### 4. Restart Your Development Server

After setting up the environment variables, restart your development server for the changes to take effect:

```bash
npm run dev
```

## Usage Notes

- The application is now configured to upload images directly to Cloudinary instead of Firebase Storage
- Image URLs will be stored in Firestore, but the actual image files will be hosted on Cloudinary
- The free tier should be sufficient for development and small-scale production use
- If you need to delete images, you'll need to implement a server-side function using Cloudinary's API with authentication

## Limitations

- The current implementation uses unsigned uploads, which are simpler but less secure
- For a production application, consider implementing signed uploads with a server-side component
- Image deletion is not fully implemented (would require server-side code with authentication)

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary React Integration](https://cloudinary.com/documentation/react_integration)
