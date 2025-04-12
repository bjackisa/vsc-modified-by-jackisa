import { db } from '@/lib/db';
import { applications } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ApplicationFormData } from '@/app/api/applications/route';

// Define the type for application data from the database
type Application = {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  application_data: ApplicationFormData;
  created_at: Date | null;
  updated_at: Date | null;
};

export default async function StudentDashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.user_id, userId)) as Application[];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Applications</h1>
      {userApplications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't submitted any applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userApplications.map((app) => (
            <div 
              key={app.id} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">Application #{app.id.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-600">
                    Submitted: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
              {app.application_data && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>Full Name: {app.application_data.fullName}</p>
                  {/* Add other application data fields as needed */}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
