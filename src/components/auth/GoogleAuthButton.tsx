'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup';
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void; // Add success callback
}

export default function GoogleAuthButton({
  mode,
  className = '',
  onError,
  onSuccess
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google authentication process");
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      console.log("Opening Google sign-in popup");
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful:", result.user.email);

      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);

      // Check if this is a new user (sign up) or existing user (sign in)
      const isNewUser = mode === 'signup' || result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        console.log("New user detected, creating Firestore document");
        // New user - create a document in Firestore
        await createUserDocument(result);
        console.log("User document created successfully");
      } else {
        console.log("Existing user signed in");
      }

      // IMPORTANT: Do NOT refresh the page - this would lose the payment context
      // Instead, notify the parent component of successful authentication
      console.log("Google auth complete, notifying parent component via callback");

      // Wait a moment to ensure auth state is properly updated
      setTimeout(() => {
        // Call the parent's onSuccess callback if available
        if (onSuccess) {
          console.log("Triggering success callback after Google authentication");
          onSuccess();
        } else {
          console.log("No success callback provided for Google authentication");
        }
      }, 500);
    } catch (error: any) {
      console.error('Google auth error:', error);
      const errorMessage = error.message || 'Failed to authenticate with Google';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new user document in Firestore
  const createUserDocument = async (userCredential: UserCredential) => {
    const user = userCredential.user;

    // Check if user document already exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        role: 'user',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    >
      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
          fill="#EA4335"
        />
        <path
          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
          fill="#4285F4"
        />
        <path
          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
          fill="#FBBC05"
        />
        <path
          d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
          fill="#34A853"
        />
      </svg>
      <span>{isLoading ? 'Processing...' : `Continue with Google`}</span>
    </button>
  );
}
