'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';

export default function DashboardRedirect() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkRole() {
      if (isLoaded && userId) {
        try {
          // Debug: Log the user's email
          console.log('User email:', user?.primaryEmailAddress?.emailAddress);

          // Check role from database
          console.log('Fetching role from database...');
          const response = await fetch('/api/check-db-role');
          const data = await response.json();

          console.log('Database role check response:', data);

          // If user not found in database, try to set the role directly
          if (!data.inDatabase && (data.email === 'qudmeet@gmail.com' || data.email === 'admin@example.com')) {
            console.log('Admin user not found in database, setting role directly...');
            try {
              // First try to sync the user ID
              console.log('Syncing user ID with Clerk...');
              const syncResponse = await fetch('/api/sync-user-id');
              if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                console.log('Sync result:', syncResult);

                if (syncResult.success) {
                  console.log('User ID synced successfully, checking role again...');
                  const newResponse = await fetch('/api/check-db-role');
                  const newData = await newResponse.json();
                  console.log('New database role check after sync:', newData);

                  // Use the new data if available
                  if (newData.inDatabase) {
                    console.log('Using updated role data after sync');
                    Object.assign(data, newData);
                  }
                }
              } else {
                // Fallback to set-db-admin if sync fails
                console.log('Sync failed, trying set-db-admin...');
                const setAdminResponse = await fetch('/api/set-db-admin');
                if (setAdminResponse.ok) {
                  console.log('Admin role set successfully, checking again...');
                  const newResponse = await fetch('/api/check-db-role');
                  const newData = await newResponse.json();
                  console.log('New database role check:', newData);

                  // Use the new data if available
                  if (newData.inDatabase) {
                    console.log('Using updated role data');
                    Object.assign(data, newData);
                  }
                }
              }
            } catch (setError) {
              console.error('Error setting admin role:', setError);
            }
          }

          if (data.error) {
            setError(data.error);
            setIsChecking(false);
            return;
          }

          if (data.role === 'admin' || data.role === 'super_admin') {
            console.log('Redirecting to admin dashboard');
            router.replace('/admin/dashboard');
          } else {
            console.log('Redirecting to student dashboard');
            router.replace('/student/dashboard');
          }
        } catch (error) {
          console.error('Error checking role:', error);
          setError('Failed to check user role');
          setIsChecking(false);
        }
      } else if (isLoaded && !userId) {
        router.replace('/sign-in');
      }
    }

    checkRole();
  }, [isLoaded, userId, user, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.replace('/student/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the appropriate dashboard.</p>
      </div>
    </div>
  );
}
