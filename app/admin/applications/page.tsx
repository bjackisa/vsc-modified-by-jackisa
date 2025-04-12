import { db } from '@/lib/db';
import { applications, documents, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import DateDisplay from './date-display';

export default async function AdminApplicationsPage() {
  // Ensure user is authenticated as admin
  await requireAdmin();

  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      user: users,
      created_at: applications.created_at,
      updated_at: applications.updated_at,
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .orderBy(applications.created_at);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Applications Management</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicationData.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.application_data?.fullName || 'No name provided'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.application_data?.email || 'No email provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DateDisplay date={application.created_at} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {applicationData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
