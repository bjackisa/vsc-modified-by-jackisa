import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SetAdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Set Admin Role</h1>
      <p className="mb-6 text-gray-600">
        Click the button below to set your Clerk user account to have admin role. 
        This will allow you to access the admin dashboard.
      </p>
      
      <div className="flex flex-col gap-4">
        <Link 
          href="/api/clerk/set-admin-role"
          className="bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
        >
          Set Admin Role
        </Link>
        
        <Link
          href="/"
          className="text-blue-600 py-2 px-4 rounded-md text-center hover:text-blue-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
