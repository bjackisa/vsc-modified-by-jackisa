'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupSuperAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    credentials?: {
      email: string;
      password: string;
    };
    nextSteps?: string;
  } | null>(null);

  const setupAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/setup-super-admin');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create admin user' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Setup Super Admin</h1>
          <p className="text-gray-600 mt-2">
            This will create a super admin user in Clerk and sync it with the database.
          </p>
        </div>
        
        <div className="space-y-6">
          {result ? (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <>
                  <p className="text-green-800 font-medium">{result.message}</p>
                  {result.credentials && (
                    <div className="mt-2">
                      <p className="text-green-700">
                        <strong>Email:</strong> {result.credentials.email}
                      </p>
                      <p className="text-green-700">
                        <strong>Password:</strong> {result.credentials.password}
                      </p>
                    </div>
                  )}
                  {result.nextSteps && (
                    <p className="text-green-700 mt-2">{result.nextSteps}</p>
                  )}
                </>
              ) : (
                <p className="text-red-800 font-medium">{result.error}</p>
              )}
            </div>
          ) : null}
          
          <button 
            onClick={setupAdmin}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Setting up...' : 'Setup Super Admin'}
          </button>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-4">
              After setting up the super admin account, you can sign in with Clerk using the credentials above.
            </p>
            
            <Link 
              href="/sign-in"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
