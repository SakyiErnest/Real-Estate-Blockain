'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import GoogleAuthButton from './GoogleAuthButton';

// Define schemas for form validation
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin'
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize forms for sign in and sign up
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Handle sign in submission
  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      onSuccess(); // Call the success callback
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up submission
  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: data.name,
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        role: 'user',
      });

      onSuccess(); // Call the success callback
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google auth success or error
  const handleGoogleAuthError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle modal close
  const handleClose = () => {
    // Reset forms and errors
    signInForm.reset();
    signUpForm.reset();
    setError('');
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      {mode === 'signin'
                        ? 'Sign in to continue with your property offer'
                        : 'Create an account to make an offer on this property'}
                    </p>

                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
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

                    <div className="mt-6">
                      {mode === 'signin' ? (
                        // Sign In Form
                        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email address
                            </label>
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signInForm.register('email')}
                            />
                            {signInForm.formState.errors.email && (
                              <p className="mt-1 text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                              Password
                            </label>
                            <input
                              id="password"
                              type="password"
                              autoComplete="current-password"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signInForm.register('password')}
                            />
                            {signInForm.formState.errors.password && (
                              <p className="mt-1 text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        // Sign Up Form - First part
                        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Full name
                            </label>
                            <input
                              id="name"
                              type="text"
                              autoComplete="name"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signUpForm.register('name')}
                            />
                            {signUpForm.formState.errors.name && (
                              <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email address
                            </label>
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signUpForm.register('email')}
                            />
                            {signUpForm.formState.errors.email && (
                              <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                              Password
                            </label>
                            <input
                              id="password"
                              type="password"
                              autoComplete="new-password"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signUpForm.register('password')}
                            />
                            {signUpForm.formState.errors.password && (
                              <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                              Confirm password
                            </label>
                            <input
                              id="confirmPassword"
                              type="password"
                              autoComplete="new-password"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              {...signUpForm.register('confirmPassword')}
                            />
                            {signUpForm.formState.errors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                            )}
                          </div>

                          <div>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              {isLoading ? 'Signing up...' : 'Sign up'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <GoogleAuthButton
                            mode={mode === 'signin' ? 'signin' : 'signup'}
                            onError={handleGoogleAuthError}
                            onSuccess={onSuccess}
                          />
                        </div>
                      </div>

                      <div className="mt-6 text-center text-sm">
                        {mode === 'signin' ? (
                          <p>
                            Don't have an account?{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setMode('signup')}
                            >
                              Sign up
                            </button>
                          </p>
                        ) : (
                          <p>
                            Already have an account?{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setMode('signin')}
                            >
                              Sign in
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}