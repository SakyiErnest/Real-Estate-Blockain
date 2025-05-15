'use client';

import { useState, useEffect } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import AuthModal from '../auth/AuthModal';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// IMPORTANT: This flag controls whether authentication is required
const REQUIRE_AUTH_FOR_PAYMENT = true;

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
}

interface SubmitOfferButtonProps {
  property: Property;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function SubmitOfferButton({
  property,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: SubmitOfferButtonProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Track authentication state to make component more responsive to changes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!auth.currentUser);

  // Set up authentication state listener
  useEffect(() => {
    console.log("SubmitOfferButton mounted");
    console.log("Current auth state:", auth.currentUser ? "User authenticated" : "No user authenticated");

    // Set up a listener to track authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? `User authenticated: ${currentUser.email}` : "User signed out");
      // Update component state when auth state changes
      setIsAuthenticated(!!currentUser);
    });

    return () => {
      console.log("Cleaning up auth listener in SubmitOfferButton");
      unsubscribe();
    };
  }, []);

  // Determine button styles based on variant and size
  const getButtonStyles = () => {
    // Base styles
    let styles = 'inline-flex items-center justify-center rounded-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

    // Add variant styles
    if (variant === 'primary') {
      styles += ' bg-indigo-600 text-white hover:bg-indigo-700';
    } else if (variant === 'secondary') {
      styles += ' bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
    } else if (variant === 'outline') {
      styles += ' bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
    }

    // Add size styles
    if (size === 'sm') {
      styles += ' px-3 py-1.5 text-sm';
    } else if (size === 'md') {
      styles += ' px-4 py-2 text-sm';
    } else if (size === 'lg') {
      styles += ' px-6 py-3 text-base';
    }

    // Add width styles
    if (fullWidth) {
      styles += ' w-full';
    }

    return styles;
  };

  // Handle button click - strictly enforce authentication
  const handleButtonClick = () => {
    console.log("Submit offer button clicked");

    // Use both the component state and a fresh check for maximum reliability
    const currentUser = auth.currentUser;
    console.log("Current auth user:", currentUser?.email || "No user");
    console.log("Component auth state:", isAuthenticated ? "Authenticated" : "Not authenticated");

    if (REQUIRE_AUTH_FOR_PAYMENT) {
      // If authentication is required, strictly enforce it
      // Use either the tracked state or the current user check
      if (isAuthenticated || currentUser) {
        console.log("User is authenticated, showing payment modal");
        setIsPaymentModalOpen(true);
      } else {
        console.log("User is NOT authenticated, showing auth modal");
        // Force the auth modal to open
        setIsAuthModalOpen(true);
        // Ensure payment modal is closed
        setIsPaymentModalOpen(false);
      }
    } else {
      // If authentication is not required (for testing only)
      console.log("Authentication requirement bypassed (for testing)");
      setIsPaymentModalOpen(true);
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    console.log("Authentication successful, closing auth modal");
    setIsAuthModalOpen(false);

    // Double-check that user is actually authenticated
    const currentUser = auth.currentUser;

    // Manually update our authentication state
    // This ensures the component knows the user is authenticated even if Firebase's
    // auth state change event hasn't fired yet
    setIsAuthenticated(true);

    if (currentUser) {
      console.log("Confirmed user is authenticated:", currentUser.email);

      // IMPORTANT: Show payment modal immediately to prevent navigation away
      console.log("Showing payment modal immediately after successful authentication");
      setIsPaymentModalOpen(true);

      // Additional verification in the background
      setTimeout(() => {
        // Verify authentication is still valid
        if (!auth.currentUser) {
          console.error("Authentication verification failed - user not logged in after auth success");
          setIsAuthenticated(false);
          setIsPaymentModalOpen(false);
          setIsAuthModalOpen(true); // Re-open auth modal
        }
      }, 1000);
    } else {
      console.warn("Authentication success reported but user is not immediately logged in - this can be normal due to auth state propagation delays");

      // Wait a short time for auth state to propagate
      console.log("Waiting for auth state to update...");
      setTimeout(() => {
        if (auth.currentUser) {
          console.log("Auth state updated, user is now authenticated:", auth.currentUser.email);
          setIsPaymentModalOpen(true);
        } else {
          console.error("Authentication state still not updated after delay");
          // Don't proceed to payment modal, re-open auth modal
          setIsAuthenticated(false);
          setIsAuthModalOpen(true);
        }
      }, 500);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`${getButtonStyles()} ${className}`}
        onClick={handleButtonClick}
      >
        <CurrencyDollarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
        Submit Offer
      </button>

      {/* Payment Modal - only shown when user is authenticated */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        property={property}
      />

      {/* Auth Modal - shown when user is not authenticated */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode="signin"
      />
    </>
  );
}
