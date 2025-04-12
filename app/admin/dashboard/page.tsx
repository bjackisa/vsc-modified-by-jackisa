import { db } from '@/lib/db';
import { applications, documents, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import UpdateStatusForm from '../applications/update-status-form';
import DocumentList from '../applications/document-list';
import DateDisplay from '../applications/date-display';

export default async function AdminDashboard() {
  const applicationData = await db
    .select({
      id: applications.id,
      status: applications.status,
      application_data: applications.application_data,
      user: users,
      documents: documents
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .leftJoin(documents, eq(documents.application_id, applications.id));

  // This function would need to be moved to a client component
  // Server components can't have interactive functions

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <a
          href="/admin/applications"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          View All Applications
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Total Applications</h2>
          <p className="text-3xl font-bold">{applicationData.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Pending Applications</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {applicationData.filter(app => app.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Approved Applications</h2>
          <p className="text-3xl font-bold text-green-600">
            {applicationData.filter(app => app.status === 'approved').length}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
      <div className="space-y-6">
        {applicationData.slice(0, 5).map((application) => (
          <div key={application.id} className="border rounded-lg p-4 sm:p-6 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {application.application_data?.fullName || 'No name provided'}
                </h2>
                <p className="text-gray-600">
                  Status: {application.status}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <UpdateStatusForm
                  applicationId={application.id}
                  currentStatus={application.status}
                />
                <a
                  href={`/admin/applications/${application.id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm text-center"
                >
                  View Details
                </a>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-2 overflow-x-auto">
                <DocumentList documents={Array.isArray(application.documents) ? application.documents : null} />
              </div>
            </div>
          </div>
        ))}

        {applicationData.length > 5 && (
          <div className="text-center mt-4">
            <a
              href="/admin/applications"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all {applicationData.length} applications →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}




