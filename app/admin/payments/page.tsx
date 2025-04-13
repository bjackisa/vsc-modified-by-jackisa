import { db } from '@/lib/db';
import { applications, users } from '@/lib/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowRight, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default async function AdminPaymentsPage() {
  // Ensure user is admin
  await requireAdmin();

  // Fetch all applications with user info
  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      created_at: applications.created_at,
      user: users,
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .orderBy(applications.created_at);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      
      <div className="grid gap-6">
        {applicationData.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {app.application_data.fullName}
                </h2>
                <p className="text-sm text-gray-600">{app.user.email}</p>
                <p className="text-sm text-gray-600">
                  Applied for: {app.application_data.countryApplyingFor}
                </p>
                <p className="text-sm text-gray-600">
                  Funding: {app.application_data.fundingType}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/admin/applications/${app.id}/payments`}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Manage Payments
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
        
        {applicationData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No applications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
