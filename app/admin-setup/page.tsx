'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminSetupPage() {
  const { user, isLoaded } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const adminEmail = 'admin@example.com';

  async function updateAdminId() {
    try {
      setIsUpdating(true);
      setMessage('Updating admin ID...');

      const response = await fetch('/api/update-admin-id');

      if (response.ok) {
        setMessage('Admin ID updated successfully! You can now go to the dashboard.');
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.message || 'Failed to update admin ID'}`);
      }
    } catch (error) {
      console.error('Error updating admin ID:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const isAdminEmail = user?.primaryEmailAddress?.emailAddress === adminEmail;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>

        {!user ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              You need to sign up or sign in with the admin email address: <strong>{adminEmail}</strong>
            </p>
            <div className="flex flex-col space-y-2">
              <Link
                href="/sign-up"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : isAdminEmail ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800">
                You are signed in with the admin email: <strong>{adminEmail}</strong>
              </p>
            </div>

            <p className="text-gray-600">
              Now you need to update your user ID in the database to match your Clerk ID.
            </p>

            {message && (
              <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {message}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <button
                onClick={updateAdminId}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isUpdating ? 'Updating...' : 'Update Admin ID'}
              </button>

              <Link
                href="/dashboard"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>

              <Link
                href="/admin-tools"
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
              >
                Admin Tools
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-800">
                You are signed in with <strong>{user.primaryEmailAddress?.emailAddress}</strong>, but you need to use the admin email: <strong>{adminEmail}</strong>
              </p>
            </div>

            <p className="text-gray-600">
              Please sign out and sign in or sign up with the admin email address.
            </p>

            <div className="flex flex-col space-y-2">
              <Link
                href="/api/create-new-admin"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Create Admin User
              </Link>

              <Link
                href="/"
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
