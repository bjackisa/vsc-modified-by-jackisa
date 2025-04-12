'use client';

import { useUser } from '@clerk/nextjs/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type DbRoleInfo = {
  authenticated: boolean;
  hasEmail: boolean;
  email?: string;
  inDatabase: boolean;
  role?: string;
  name?: string;
  error?: string;
};

export default function CheckRolePage() {
  const { user, isLoaded } = useUser();
  const [dbRoleInfo, setDbRoleInfo] = useState<DbRoleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDbRole() {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/check-db-role');
          const data = await response.json();
          setDbRoleInfo(data);
        } catch (error) {
          console.error('Error fetching DB role:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !user) {
        setIsLoading(false);
      }
    }

    fetchDbRole();
  }, [isLoaded, user]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:text-blue-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">User Role Information</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">User Details</h2>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Clerk Role Information</h2>
            <p><strong>Role from metadata:</strong> {user.publicMetadata?.role as string || 'No role set'}</p>
            <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto text-sm">
              {JSON.stringify(user.publicMetadata, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Database Role Information</h2>
            {dbRoleInfo ? (
              <>
                {dbRoleInfo.inDatabase ? (
                  <>
                    <p><strong>In Database:</strong> Yes</p>
                    <p><strong>Role:</strong> {dbRoleInfo.role || 'No role set'}</p>
                    <p><strong>Name:</strong> {dbRoleInfo.name}</p>
                  </>
                ) : (
                  <p><strong>In Database:</strong> No - User not found in database</p>
                )}
              </>
            ) : (
              <p>Failed to fetch database role information</p>
            )}
          </div>

          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold mb-2">Actions</h2>
            <div className="space-y-2">
              <Link
                href="/api/set-db-admin"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Set as Super Admin in Database
              </Link>
              <button
                onClick={async () => {
                  try {
                    // Force refresh after setting role
                    await fetch('/api/set-db-admin');
                    window.location.reload();
                  } catch (error) {
                    console.error('Error setting admin role:', error);
                    alert('Failed to set admin role. See console for details.');
                  }
                }}
                className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center mt-2"
              >
                Set Admin & Refresh
              </button>
              <button
                onClick={async () => {
                  try {
                    // Sync user ID with Clerk
                    const response = await fetch('/api/sync-user-id');
                    const result = await response.json();
                    console.log('Sync result:', result);
                    window.location.reload();
                  } catch (error) {
                    console.error('Error syncing user ID:', error);
                    alert('Failed to sync user ID. See console for details.');
                  }
                }}
                className="block w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-center mt-2"
              >
                Sync User ID
              </button>
              <Link
                href="/api/set-admin-role"
                className="block w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-center"
              >
                Set as Super Admin in Clerk
              </Link>
              <Link
                href="/dashboard"
                className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/admin-tools"
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
              >
                Admin Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
