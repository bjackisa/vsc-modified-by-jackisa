import Link from 'next/link';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function DirectAdminPage() {
  // Check if super admin exists
  const superAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'qudmeet@gmail.com'))
    .limit(1);
  
  const adminExists = superAdmin.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-gray-600 mt-2">Super Admin Account Setup</p>
        </div>
        
        <div className="space-y-6">
          {adminExists ? (
            <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
              <p className="text-green-800">
                <strong>Super admin account exists!</strong>
              </p>
              <p className="text-green-700 mt-2">
                Email: qudmeet@gmail.com<br />
                Password: admin@qudmeet123
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
              <p className="text-yellow-800">
                <strong>Super admin account not found.</strong> Click the button below to create it.
              </p>
            </div>
          )}
          
          <form action="/api/admin/direct-setup" method="POST">
            <button 
              type="submit"
              className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
                adminExists 
                  ? 'bg-gray-500 hover:bg-gray-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={adminExists}
            >
              {adminExists ? 'Account Already Set Up' : 'Create Super Admin Account'}
            </button>
          </form>
          
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
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
