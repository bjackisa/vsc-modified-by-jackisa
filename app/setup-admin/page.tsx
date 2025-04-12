import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SetupAdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect_url=/setup-admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Setup Admin Account</h1>
          <p className="text-gray-600 mt-2">
            You're signed in. Click the button below to set up your account as a super admin.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800">
              <strong>Note:</strong> This page is for setting up the super admin account. 
              Once set up, you'll be able to access the admin dashboard and manage users.
            </p>
          </div>
          
          <div>
            <Link 
              href="/api/admin/setup-admin"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Set Up as Super Admin
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
